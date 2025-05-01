import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentFormValues } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  generateTimeSlots, 
  getCurrentDateForInput,
  isDateInPast
} from "@/lib/utils/date-utils";

// Define the validation schema using zod
const appointmentFormSchema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  specialization: z.string().min(2, "Specialization is required"),
  date: z.string()
    .refine(value => !isDateInPast(value), {
      message: "Appointment date cannot be in the past",
    }),
  time: z.string().min(1, "Time is required"),
  status: z.enum(["Pending", "Confirmed", "Cancelled"]),
});

interface AppointmentFormProps {
  appointmentId?: number;
  isEditMode?: boolean;
}

export function AppointmentForm({ appointmentId, isEditMode = false }: AppointmentFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const timeSlots = generateTimeSlots();

  // Initialize the form with default values
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      specialization: "",
      date: getCurrentDateForInput(),
      time: "",
      status: "Pending",
    },
  });

  // Fetch appointment data if in edit mode
  const { isLoading: isLoadingAppointment } = useQuery({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: isEditMode && !!appointmentId,
    onSuccess: (data) => {
      form.reset({
        patientId: data.patientId,
        doctorId: data.doctorId,
        specialization: data.specialization || "",
        date: data.date,
        time: data.time,
        status: data.status,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load appointment data",
        variant: "destructive",
      });
      console.error("Error loading appointment:", error);
    }
  });

  // Fetch patients for dropdown
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch doctors for dropdown
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['/api/doctors'],
  });

  // Handle form submission
  const appointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      if (isEditMode && appointmentId) {
        return apiRequest("PUT", `/api/appointments/${appointmentId}`, data);
      } else {
        return apiRequest("POST", "/api/appointments", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Appointment ${isEditMode ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      navigate("/appointments");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} appointment: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error submitting form:", error);
    }
  });

  const onSubmit = (data: AppointmentFormValues) => {
    appointmentMutation.mutate(data);
  };

  // Update specialization when doctor is selected
  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors?.find(d => d.id === parseInt(doctorId));
    if (doctor) {
      form.setValue("specialization", doctor.expertise);
    }
  };

  const isLoading = isLoadingAppointment || isLoadingPatients || isLoadingDoctors;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Appointment" : "New Appointment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ? String(field.value) : undefined}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map(patient => (
                          <SelectItem key={patient.id} value={String(patient.id)}>
                            {patient.name} ({patient.bloodGroup || 'No blood group'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {doctors?.map(doctor => (
                          <SelectItem key={doctor.id} value={String(doctor.id)}>
                            {doctor.name} ({doctor.expertise})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input {...field} />
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/appointments")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={appointmentMutation.isPending}>
                {appointmentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Appointment" : "Save Appointment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
