import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AppointmentWithRelations } from "@/types";
import { formatDate, formatTime } from "@/lib/utils/date-utils";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

export function UpcomingAppointments() {
  const { token } = useAuth();

  const { data: appointments, isLoading, error } = useQuery<AppointmentWithRelations[]>({
    queryKey: ['/api/appointments/upcoming'],
    queryFn: async () => {
      console.log('Fetching upcoming appointments...');
      try {
        const response = await apiRequest('GET', '/api/appointments/upcoming');
        const data = await response.json();
        console.log('Upcoming appointments data:', data);
        return data;
      } catch (error) {
        console.error('Failed to fetch upcoming appointments:', error);
        throw error;
      }
    },
    enabled: !!token
  });

  return (
    <Card className="mb-8">
      <CardHeader className="px-5 py-4 border-b border-neutral-100">
        <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading appointments: {(error as Error).message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments && appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                            {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900">{appointment.patient.name}</div>
                            <div className="text-xs text-neutral-500">{appointment.patient.bloodGroup} Blood Group</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-900">{appointment.doctor.name}</div>
                        <div className="text-xs text-neutral-500">{appointment.specialization}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-900">{formatDate(appointment.date)}</div>
                        <div className="text-xs text-neutral-500">{formatTime(appointment.time)}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={appointment.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/admin/appointments/edit/${appointment.id}`}>
                            <Button variant="link" size="sm" className="text-primary">
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/admin/appointments/edit/${appointment.id}`}>
                            <Button variant="link" size="sm" className="text-destructive">
                              Cancel
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                      No upcoming appointments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="mt-4 text-right">
              <Link href="/admin/appointments">
                <Button variant="link" className="text-primary font-medium hover:text-primary-600">
                  View all appointments →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
