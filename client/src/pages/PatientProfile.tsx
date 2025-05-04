import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PatientLayout } from "@/components/layout/PatientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, User, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";

// Define the validation schema using zod
const patientProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bloodGroup: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits")
    .regex(/^[0-9]{10}$/, "Phone must contain only digits"),
  email: z.string().email("Please provide a valid email"),
});

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;

export default function PatientProfile() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize the form
  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      name: "",
      bloodGroup: "",
      dob: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // Fetch patient profile data
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patientProfile'],
    queryFn: async () => {
      // Get the patient ID from the token
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.id;

      if (!patientId) {
        throw new Error('Patient ID not found in token');
      }

      const response = await fetch(`/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient profile');
      }

      const data = await response.json();
      console.log("Patient profile data:", data);
      
      // Format date as YYYY-MM-DD for the input field
      if (data.dob) {
        data.dob = new Date(data.dob).toISOString().split('T')[0];
      }
      
      // Reset form with fetched data
      form.reset({
        name: data.name || "",
        bloodGroup: data.bloodGroup || "",
        dob: data.dob || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
      });
      
      return data;
    },
    enabled: !!token
  });

  // Mutation for updating patient profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: PatientProfileFormValues) => {
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.id;

      if (!patientId) {
        throw new Error('Patient ID not found in token');
      }

      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: PatientProfileFormValues) => {
    updateProfileMutation.mutate(data);
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

  return (
    <PatientLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Profile</h2>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center"
          >
            <User className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Profile" : "Profile Information"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
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
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
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
                          <Textarea {...field} />
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
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : patient ? (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-semibold mr-4">
                    {patient.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{patient.name}</h3>
                    <p className="text-neutral-500">Patient ID: {patient.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Blood Group</h4>
                    <p className="text-neutral-900">{patient.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Date of Birth</h4>
                    <p className="text-neutral-900">
                      {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Address</h4>
                    <p className="text-neutral-900">{patient.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Phone Number</h4>
                    <p className="text-neutral-900">{patient.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Email</h4>
                    <p className="text-neutral-900">{patient.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-neutral-500">No profile information available</p>
            )}
          </CardContent>
        </Card>
      )}
    </PatientLayout>
  );
}
