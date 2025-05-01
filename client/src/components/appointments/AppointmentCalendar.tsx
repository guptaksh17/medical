import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AppointmentWithRelations } from "@/types";
import { format, parseISO, isSameDay, addMonths, subMonths } from "date-fns";
import { formatTime } from "@/lib/utils/date-utils";

export function AppointmentCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  
  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<AppointmentWithRelations[]>({
    queryKey: ['/api/appointments'],
  });
  
  // Filter appointments for the selected date
  const appointmentsForDate = React.useMemo(() => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date.toString());
      return isSameDay(appointmentDate, date);
    });
  }, [appointments, date]);
  
  // Group appointments by doctor
  const appointmentsByDoctor = React.useMemo(() => {
    if (!appointmentsForDate || appointmentsForDate.length === 0) return {};
    
    const grouped = appointmentsForDate.reduce((acc, appointment) => {
      const doctorId = appointment.doctor.id;
      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor: appointment.doctor,
          appointments: []
        };
      }
      acc[doctorId].appointments.push(appointment);
      return acc;
    }, {});
    
    return grouped;
  }, [appointmentsForDate]);
  
  // Get dates with appointments for highlighting in the calendar
  const datesWithAppointments = React.useMemo(() => {
    if (!appointments) return [];
    
    return appointments.map(appointment => 
      parseISO(appointment.date.toString())
    );
  }, [appointments]);
  
  const handlePreviousMonth = () => {
    setDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setDate(prevDate => addMonths(prevDate, 1));
  };
  
  const handleToday = () => {
    setDate(new Date());
  };

  // Function to determine the CSS class for appointment status
  const getAppointmentStatusClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "border-l-2 border-green-500 bg-green-50";
      case "Pending":
        return "border-l-2 border-yellow-500 bg-yellow-50";
      case "Cancelled":
        return "border-l-2 border-red-500 bg-red-50";
      default:
        return "border-l-2 border-gray-500 bg-gray-50";
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-5 w-5 text-neutral-500" />
          </Button>
          <h4 className="font-medium">{format(date, 'MMMM yyyy')}</h4>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
        <div className="flex">
          <Button variant="outline" size="sm" className="mr-2" onClick={handleToday}>
            Today
          </Button>
          <Select
            value={view}
            onValueChange={(v) => setView(v as "month" | "week" | "day")}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="col-span-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded border"
            disabled={{ before: new Date() }}
            modifiers={{
              booked: datesWithAppointments
            }}
            modifiersStyles={{
              booked: { 
                fontWeight: 'bold',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '50%'
              }
            }}
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">
              Appointments for {format(date, 'MMMM d, yyyy')}
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                {appointmentsForDate.length > 0 ? (
                  <div className="space-y-6">
                    {Object.values(appointmentsByDoctor).map((group: any) => (
                      <div key={group.doctor.id} className="space-y-2">
                        <h4 className="font-medium text-primary">
                          {group.doctor.name} - {group.doctor.expertise}
                        </h4>
                        <div className="space-y-2">
                          {group.appointments.map((appointment: AppointmentWithRelations) => (
                            <div 
                              key={appointment.id}
                              className={`p-2 rounded text-sm ${getAppointmentStatusClass(appointment.status)}`}
                            >
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-medium">{formatTime(appointment.time)}</span> - {appointment.patient.name}
                                </div>
                                <div>
                                  <Link href={`/appointments/edit/${appointment.id}`}>
                                    <Button variant="ghost" size="sm" className="h-6 px-2">Edit</Button>
                                  </Link>
                                </div>
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                Status: {appointment.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No appointments scheduled for this date
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <Link href="/appointments/new">
                    <Button>Schedule New Appointment</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
