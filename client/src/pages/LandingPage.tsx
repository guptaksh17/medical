import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, User, UserCog } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Heart className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">HealthSync</h1>
        <p className="text-xl text-gray-600">Appointment Scheduling System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Patient Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Book appointments, view your schedule, and provide feedback to doctors.
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/patient/login">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/patient/register">
                <Button variant="outline" className="w-full">Register</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserCog className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Manage patients, doctors, appointments, and view reports.
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/login">
                <Button className="w-full">Admin Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} HealthSync. All rights reserved.</p>
      </div>
    </div>
  );
}
