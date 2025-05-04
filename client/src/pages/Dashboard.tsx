import React from "react";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { DoctorPerformance } from "@/components/dashboard/DoctorPerformance";
import { RecentFeedback } from "@/components/dashboard/RecentFeedback";

export default function Dashboard() {

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      {/* Welcome message */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-medium mb-2">Welcome to the Admin Dashboard</h3>
        <p className="text-gray-600">
          Use the navigation menu to manage appointments, patients, doctors, and view feedback.
        </p>
      </div>

      {/* Upcoming Appointments Section */}
      <UpcomingAppointments />

      {/* Doctor Performance and Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoctorPerformance />
        <RecentFeedback />
      </div>
    </>
  );
}
