import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

// Define the validation schema using zod
const patientLoginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
});

type PatientLoginFormValues = z.infer<typeof patientLoginSchema>;

export default function PatientLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // Initialize the form with default values
  const form = useForm<PatientLoginFormValues>({
    resolver: zodResolver(patientLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const loginMutation = useMutation({
    mutationFn: async (data: PatientLoginFormValues) => {
      console.log("Attempting login with:", data.email);

      try {
        const response = await fetch("/api/auth/patient/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Login failed with status: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Login successful, received token");

      // Use the login function from AuthContext with patient role
      login(data.token, 'patient');

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Redirect to patient dashboard after a short delay
      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 100);
    },
    onError: (error: any) => {
      console.error("Login error details:", error);

      toast({
        title: "Error",
        description: error.message || "Login failed. Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PatientLoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">HealthSync</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to your patient account
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Don't have an account?{" "}
                  <Link href="/patient/register">
                    <span className="text-primary hover:underline">Register</span>
                  </Link>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 mb-2">Are you an administrator?</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={() => navigate("/login")}
                  >
                    Go to Admin Login
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
