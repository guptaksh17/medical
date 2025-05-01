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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientFormValues } from "@/types";
import { Patient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the validation schema using zod
const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bloodGroup: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits"),
  email: z.string().email("Please provide a valid email"),
});

interface PatientFormProps {
  patientId?: number;
  isEditMode?: boolean;
}

export function PatientForm({ patientId, isEditMode = false }: PatientFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Initialize the form with default values
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      bloodGroup: "",
      dob: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // Fetch patient data if in edit mode
  const { isLoading: isLoadingPatient } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: isEditMode && !!patientId,
    onSuccess: (data) => {
      // Format date as YYYY-MM-DD for the input field
      const formattedDob = data.dob 
        ? new Date(data.dob).toISOString().split('T')[0]
        : '';
        
      form.reset({
        name: data.name,
        bloodGroup: data.bloodGroup || "",
        dob: formattedDob,
        address: data.address || "",
        phone: data.phone,
        email: data.email,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
      console.error("Error loading patient:", error);
    }
  });

  // Handle form submission
  const patientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      if (isEditMode && patientId) {
        return apiRequest("PUT", `/api/patients/${patientId}`, data);
      } else {
        return apiRequest("POST", "/api/patients", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Patient ${isEditMode ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      navigate("/patients");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} patient`,
        variant: "destructive",
      });
      console.error("Error submitting form:", error);
    }
  });

  const onSubmit = (data: PatientFormValues) => {
    patientMutation.mutate(data);
  };

  const bloodGroups = [
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  if (isEditMode && isLoadingPatient) {
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
        <CardTitle>{isEditMode ? "Edit Patient" : "Add New Patient"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
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
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
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
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <p className="text-xs text-neutral-500">10 digits required</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/patients")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={patientMutation.isPending}>
                {patientMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Patient" : "Save Patient"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
