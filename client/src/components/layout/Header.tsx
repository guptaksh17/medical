import React from "react";
import { Heart, LogOut, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-primary">HealthSync</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-primary">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-primary">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-500 hover:text-destructive"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium hidden md:inline">Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
