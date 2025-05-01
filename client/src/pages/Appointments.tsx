import React, { useState } from "react";
import { Link } from "wouter";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

interface AppointmentsProps {
  isForm?: boolean;
  isEditMode?: boolean;
  id?: string;
}

export default function Appointments({ isForm = false, isEditMode = false, id }: AppointmentsProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const appointmentId = id ? parseInt(id) : undefined;

  if (isForm) {
    return (
      <>
        <h2 className="text-xl font-bold mb-6">
          {isEditMode ? "Edit Appointment" : "New Appointment"}
        </h2>
        <AppointmentForm appointmentId={appointmentId} isEditMode={isEditMode} />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Appointments</h2>
        <Link href="/appointments/new">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            New Appointment
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-5">
          <Tabs defaultValue={view} onValueChange={(value) => setView(value as "calendar" | "list")}>
            <TabsList className="mb-6">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-0">
              <AppointmentCalendar />
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <AppointmentList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
