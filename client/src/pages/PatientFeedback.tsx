import React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/date-utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";

// Define the validation schema for feedback
const feedbackFormSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required").max(5, "Rating cannot exceed 5"),
  comments: z.string().min(5, "Comments must be at least 5 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface PatientFeedbackProps {
  isForm?: boolean;
  appointmentId?: string;
}

export default function PatientFeedback({ isForm = false, appointmentId }: PatientFeedbackProps) {
  const [, navigate] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const apptId = appointmentId ? parseInt(appointmentId) : undefined;

  // Fetch patient's feedback
  const { data: feedbackList, isLoading: feedbackLoading } = useQuery({
    queryKey: ['patientFeedback'],
    queryFn: async () => {
      // Get the patient ID from the token
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.id;

      if (!patientId) {
        throw new Error('Patient ID not found in token');
      }

      // Fetch only the patient's own feedback
      const response = await fetch(`/api/feedback/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      console.log("Patient feedback data:", data);
      return data;
    },
    enabled: !!token && !isForm
  });

  // Fetch appointment details for feedback form
  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ['appointment', apptId],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${apptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointment details');
      }

      return response.json();
    },
    enabled: !!token && isForm && !!apptId
  });

  // Initialize the form with default values
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 0,
      comments: "",
    },
  });

  // Handle form submission for feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      // Get the patient ID from the token
      const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const patientId = decodedToken?.id;

      if (!patientId) {
        throw new Error('Patient ID not found in token');
      }

      const feedbackData = {
        ...data,
        appointmentId: apptId,
        givenBy: 'Patient',
        givenById: patientId,
        receiverType: 'Doctor',
        receiverId: appointment?.doctor?.id
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit feedback: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['patientFeedback'] });
      navigate("/patient/feedback");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FeedbackFormValues) => {
    submitFeedbackMutation.mutate(data);
  };

  // Star rating component
  const StarRating = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isForm && apptId) {
    return (
      <PatientLayout>
        <h2 className="text-2xl font-bold mb-6">Provide Feedback</h2>
        {appointmentLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : appointment ? (
          <Card>
            <CardHeader>
              <CardTitle>Feedback for Dr. {appointment.doctor?.name}</CardTitle>
              <p className="text-sm text-gray-500">
                Appointment on {formatDate(appointment.date)} at {appointment.time}
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <StarRating
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
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
                            placeholder="Share your experience with the doctor..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/patient/feedback")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitFeedbackMutation.isPending}
                    >
                      {submitFeedbackMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Feedback"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Appointment not found</p>
            <Button
              variant="outline"
              onClick={() => navigate("/patient/appointments")}
            >
              Back to Appointments
            </Button>
          </div>
        )}
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <h2 className="text-2xl font-bold mb-6">My Feedback</h2>

      <Card>
        <CardContent className="pt-6">
          {feedbackLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedbackList && feedbackList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Submitted On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">
                      Dr. {feedback.appointment.doctor.name}
                    </TableCell>
                    <TableCell>
                      {formatDate(feedback.appointment.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {feedback.comments}
                    </TableCell>
                    <TableCell>{formatDate(feedback.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No feedback submitted yet</p>
              <Button
                variant="outline"
                onClick={() => navigate("/patient/appointments")}
              >
                View Appointments
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PatientLayout>
  );
}
