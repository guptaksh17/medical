import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  patientRoute?: boolean;
}

export function ProtectedRoute({ children, patientRoute = false }: ProtectedRouteProps) {
  const { isAuthenticated, isUserRole } = useAuth();

  // Determine the expected role and redirect path
  const expectedRole = patientRoute ? 'patient' : 'admin';
  const redirectPath = patientRoute ? '/patient/login' : '/login';

  // Simple authentication and role check
  if (!isAuthenticated) {
    console.log(`Not authenticated, should redirect to ${redirectPath}`);
    return <Redirect to={redirectPath} />;
  }

  if (!isUserRole(expectedRole)) {
    console.log(`Wrong role (expected ${expectedRole}), should redirect to ${redirectPath}`);
    return <Redirect to={redirectPath} />;
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
}
