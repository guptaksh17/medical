import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userRole: string | null;
  login: (newToken: string, role: string) => void;
  logout: () => void;
  isUserRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize auth state from localStorage only once on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');

    if (storedToken && storedRole) {
      setToken(storedToken);
      setUserRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (newToken: string, role: string) => {
    // Store auth data in localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', role);

    // Update state
    setToken(newToken);
    setUserRole(role);
    setIsAuthenticated(true);

    console.log(`User logged in as ${role}`);
  };

  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');

    // Update state
    setToken(null);
    setUserRole(null);
    setIsAuthenticated(false);

    console.log('User logged out');

    // No navigation here - will be handled by the component that calls logout
  };

  // Helper function to check if the user has a specific role
  const isUserRole = (role: string): boolean => {
    return userRole === role;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userRole, login, logout, isUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
