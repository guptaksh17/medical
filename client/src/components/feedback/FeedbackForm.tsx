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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackFormValues } from "@/types";
import { AppointmentWithRelations } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/utils/date-utils";

// Define the validation schema using zod
const feedbackFormSchema = z.object({
  appointmentId: z.number(),
  givenBy: z.enum(["Patient", "Doctor"]),
  givenById: z.number(),
  receiverId: z.number(),
  receiverType: z.enum(["Patient", "Doctor"]),
  comments: z.string().min(5, "Comments must be at least 5 characters"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});

interface FeedbackFormProps {
  appointmentId: number;
}

export function FeedbackForm({ appointmentId }: FeedbackFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [rating, setRating] = React.useState(5);

  // Fetch appointment data
  const { data: appointment, isLoading } = useQuery<AppointmentWithRelations>({
    queryKey: [`/api/appointments/${appointmentId}`],
    enabled: !!appointmentId,
  });

  // Initialize the form with default values
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      appointmentId,
      givenBy: "Patient", // Default to feedback given by Patient
      givenById: 0,
      receiverId: 0,
      receiverType: "Doctor", // Default to feedback for Doctor
      comments: "",
      rating: 5,
    },
  });

  // Update form values when appointment data is loaded
  React.useEffect(() => {
    if (appointment) {
      form.setValue("givenById", appointment.patientId);
      form.setValue("receiverId", appointment.doctorId);
    }
  }, [appointment, form]);

  // Handle form submission
  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      return apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      navigate("/feedback");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
      console.error("Error submitting feedback:", error);
    }
  });

  const onSubmit = (data: FeedbackFormValues) => {
    feedbackMutation.mutate(data);
  };

  // Handle star rating click
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    form.setValue("rating", newRating);
  };

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

  if (!appointment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-neutral-700 mb-4">Appointment not found</p>
            <Button onClick={() => navigate("/appointments")}>
              Back to Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provide Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-neutral-50 rounded-md">
          <h3 className="font-semibold mb-2">Appointment Details:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Patient</p>
              <p>{appointment.patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Doctor</p>
              <p>{appointment.doctor.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Specialization</p>
              <p>{appointment.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Date & Time</p>
              <p>{formatDate(appointment.date)} at {formatTime(appointment.time)}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                      <Input
                        type="hidden"
                        {...field}
                        value={rating}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Please share your experience..."
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={feedbackMutation.isPending}>
                {feedbackMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Feedback
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
