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
import { DoctorFormValues } from "@/types";
import { Doctor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the validation schema using zod
const doctorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits"),
  address: z.string().optional(),
  expertise: z.string().min(2, "Expertise must be at least 2 characters"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  gender: z.string().optional(),
});

interface DoctorFormProps {
  doctorId?: number;
  isEditMode?: boolean;
}

export function DoctorForm({ doctorId, isEditMode = false }: DoctorFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Initialize the form with default values
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      expertise: "",
      experience: 0,
      gender: "",
    },
  });

  // Fetch doctor data if in edit mode
  const { isLoading: isLoadingDoctor } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: isEditMode && !!doctorId,
    onSuccess: (data) => {
      form.reset({
        name: data.name,
        phone: data.phone,
        address: data.address || "",
        expertise: data.expertise,
        experience: data.experience,
        gender: data.gender || "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load doctor data",
        variant: "destructive",
      });
      console.error("Error loading doctor:", error);
    }
  });

  // Handle form submission
  const doctorMutation = useMutation({
    mutationFn: async (data: DoctorFormValues) => {
      if (isEditMode && doctorId) {
        return apiRequest("PUT", `/api/doctors/${doctorId}`, data);
      } else {
        return apiRequest("POST", "/api/doctors", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Doctor ${isEditMode ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      navigate("/doctors");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} doctor`,
        variant: "destructive",
      });
      console.error("Error submitting form:", error);
    }
  });

  const onSubmit = (data: DoctorFormValues) => {
    doctorMutation.mutate(data);
  };

  const expertiseOptions = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "General Medicine",
    "Neurology",
    "Obstetrics & Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Radiology",
    "Urology"
  ];

  if (isEditMode && isLoadingDoctor) {
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
        <CardTitle>{isEditMode ? "Edit Doctor" : "Add New Doctor"}</CardTitle>
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
                    <Input {...field} placeholder="Dr. John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expertise/Specialization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Expertise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expertiseOptions.map((expertise) => (
                          <SelectItem key={expertise} value={expertise}>
                            {expertise}
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
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/doctors")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={doctorMutation.isPending}>
                {doctorMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Doctor" : "Save Doctor"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
