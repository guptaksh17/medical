import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Home, 
  LogOut, 
  MessageCircleHeart, 
  User,
  Heart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/patient/login");
  };

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-xl font-bold text-gray-900">HealthSync</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Patient Portal</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center text-gray-600"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-2 sticky top-8">
              <Button
                variant={isActive("/patient/dashboard") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/patient/dashboard")}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={isActive("/patient/appointments") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/patient/appointments")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </Button>
              <Button
                variant={isActive("/patient/feedback") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/patient/feedback")}
              >
                <MessageCircleHeart className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              <Button
                variant={isActive("/patient/profile") ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate("/patient/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HealthSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
