import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PatientLayout } from "@/components/layout/PatientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Plus, Search, Loader2, MessageCircleHeart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/date-utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { generateTimeSlots, getCurrentDateForInput, isDateInPast } from "@/lib/utils/date-utils";

// Define the validation schema for appointment booking
const appointmentFormSchema = z.object({
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  specialization: z.string().min(2, "Specialization is required"),
  date: z.string()
    .refine(value => !isDateInPast(value), {
      message: "Appointment date cannot be in the past",
    }),
  time: z.string().min(1, "Time is required"),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface PatientAppointmentsProps {
  isForm?: boolean;
}

export default function PatientAppointments({ isForm = false }: PatientAppointmentsProps) {
  const [, navigate] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const timeSlots = generateTimeSlots();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch patient's appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['patientAppointments', searchTerm, statusFilter],
    queryFn: async () => {
      // Get the patient ID from the token
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.id;

      if (!patientId) {
        throw new Error('Patient ID not found in token');
      }

      // Use the correct endpoint with the patient ID
      let url = `/api/appointments/patient/${patientId}`;
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Fetching appointments from:", url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      console.log("Appointments data:", data);
      return data;
    },
    enabled: !!token && !isForm
  });

  // Fetch doctors for appointment booking
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      return response.json();
    },
    enabled: !!token && isForm
  });

  // Initialize the form with default values
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      doctorId: 0,
      specialization: "",
      date: getCurrentDateForInput(),
      time: "",
    },
  });

  // Handle form submission for booking appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to book appointment: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      navigate("/patient/appointments");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: AppointmentFormValues) => {
    // Get the patient ID from the token
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const patientId = decodedToken?.id;

    if (!patientId) {
      toast({
        title: "Error",
        description: "Patient ID not found in token. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Add the patient ID to the form data
    const appointmentData = {
      ...data,
      patientId,
      status: 'Pending'
    };

    console.log("Submitting appointment data:", appointmentData);
    bookAppointmentMutation.mutate(appointmentData);
  };

  // Mutation for updating appointment status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, newStatus }: { appointmentId: number, newStatus: string }) => {
      console.log(`Updating appointment ${appointmentId} status to ${newStatus}`);

      // Use the direct status update endpoint
      const response = await fetch(`/api/update-status/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        // Only try to read the response body once
        let errorText = 'Unknown error';
        try {
          // Clone the response before reading it
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.text();
          errorText = errorData;
        } catch (e) {
          console.error('Error reading response:', e);
        }
        console.error('Error response:', response.status, errorText);
        throw new Error(`Failed to update appointment status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Status update successful:', data);

      // Show success message from the server if available
      const message = data.message || `Appointment marked as ${variables.newStatus}`;

      // Refresh the appointments list
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });

      toast({
        title: "Success",
        description: message,
      });

      // If status is changed to Completed, prompt to provide feedback
      if (variables.newStatus === 'Completed') {
        // Use a slight delay to ensure the first toast is visible
        setTimeout(() => {
          toast({
            title: "Feedback",
            description: "Would you like to provide feedback for this appointment?",
            action: (
              <Button
                variant="outline"
                onClick={() => navigate(`/patient/feedback/new/${variables.appointmentId}`)}
              >
                Give Feedback
              </Button>
            ),
            duration: 10000, // Show for 10 seconds
          });
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update appointment status",
        variant: "destructive",
      });
    }
  });

  // Handle appointment status change
  const handleStatusChange = (appointment: any, newStatus: string) => {
    updateStatusMutation.mutate({
      appointmentId: appointment.id,
      newStatus
    });
  };

  // Handle doctor selection to auto-fill specialization
  const handleDoctorChange = (doctorId: string) => {
    console.log("Selected doctor ID:", doctorId);
    console.log("Available doctors:", doctors);

    // Handle different doctor object structures
    const selectedDoctor = doctors?.find(doc => {
      // Check if doc.id exists and convert to string for comparison
      if (doc.id !== undefined) {
        return doc.id.toString() === doctorId;
      }
      // Check if doc.Doctor_ID exists (MySQL naming convention)
      if (doc.Doctor_ID !== undefined) {
        return doc.Doctor_ID.toString() === doctorId;
      }
      return false;
    });

    console.log("Selected doctor:", selectedDoctor);

    if (selectedDoctor) {
      // Handle different property names (expertise or Expertise)
      const specialization = selectedDoctor.expertise || selectedDoctor.Expertise;
      if (specialization) {
        form.setValue("specialization", specialization);
      }
    }
  };

  if (isForm) {
    return (
      <PatientLayout>
        <h2 className="text-2xl font-bold mb-6">Book New Appointment</h2>
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleDoctorChange(value);
                        }}
                        defaultValue={field.value ? String(field.value) : undefined}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctorsLoading ? (
                            <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                          ) : doctors?.map(doctor => {
                            // Handle different doctor object structures
                            const doctorId = doctor.id || doctor.Doctor_ID;
                            const doctorName = doctor.name || doctor.Name;
                            const doctorExpertise = doctor.expertise || doctor.Expertise;

                            return (
                              <SelectItem key={doctorId} value={String(doctorId)}>
                                {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`} - {doctorExpertise}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Time Slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map(slot => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/patient/appointments")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={bookAppointmentMutation.isPending}
                  >
                    {bookAppointmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Book Appointment"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <Button
          className="flex items-center"
          onClick={() => navigate("/patient/appointments/new")}
        >
          <Plus className="h-4 w-4 mr-1" />
          Book Appointment
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {appointmentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments && appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.doctor.name.startsWith('Dr.')
                        ? appointment.doctor.name
                        : `Dr. ${appointment.doctor.name}`}
                    </TableCell>
                    <TableCell>{appointment.specialization}</TableCell>
                    <TableCell>{formatDate(appointment.date)}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {appointment.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appointment, 'Completed')}
                            disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.appointmentId === appointment.id}
                          >
                            {updateStatusMutation.isPending && updateStatusMutation.variables?.appointmentId === appointment.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Mark Completed"
                            )}
                          </Button>
                        )}
                        {appointment.status === 'Completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/patient/feedback/new/${appointment.id}`)}
                          >
                            Give Feedback
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No appointments found</p>
              <Button
                variant="outline"
                onClick={() => navigate("/patient/appointments/new")}
              >
                Book Your First Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PatientLayout>
  );
}
