import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserCircle, 
  Calendar, 
  Star 
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { DoctorPerformance } from "@/components/dashboard/DoctorPerformance";
import { RecentFeedback } from "@/components/dashboard/RecentFeedback";
import { DashboardStats } from "@/types";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Patients"
              value={stats?.totalPatients || 0}
              icon={<Users className="h-6 w-6 text-primary" />}
              trend={{ value: "+12% from last month", positive: true }}
            />
            
            <StatsCard
              title="Total Doctors"
              value={stats?.totalDoctors || 0}
              icon={<UserCircle className="h-6 w-6 text-secondary" />}
              trend={{ value: "+5% from last month", positive: true }}
            />
            
            <StatsCard
              title="Appointments (Today)"
              value={stats?.todayAppointments || 0}
              icon={<Calendar className="h-6 w-6 text-accent" />}
              trend={{ value: "-3% from yesterday", positive: false }}
            />
            
            <StatsCard
              title="Average Rating"
              value={stats?.averageRating?.toFixed(1) || "0.0"}
              icon={<Star className="h-6 w-6 text-yellow-500" />}
              trend={{ value: "+0.2 from last month", positive: true }}
            />
          </div>

          {/* Upcoming Appointments Section */}
          <UpcomingAppointments />

          {/* Doctor Performance and Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DoctorPerformance />
            <RecentFeedback />
          </div>
        </>
      )}
    </>
  );
}
