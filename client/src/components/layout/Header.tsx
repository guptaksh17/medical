import React from "react";
import { Heart } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-primary">HealthSync</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex space-x-4">
            <button className="text-neutral-500 hover:text-primary">Help</button>
            <button className="text-neutral-500 hover:text-primary">Settings</button>
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
