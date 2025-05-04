import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, MessageCircleHeart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/layout/PatientLayout";
import { formatDate } from "@/lib/utils/date-utils";

export default function PatientDashboard() {
  const { token } = useAuth();

  // Fetch patient's appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['patientAppointments'],
    queryFn: async () => {
      const response = await fetch('/api/patient/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      return response.json();
    },
    enabled: !!token
  });

  // Fetch patient's feedback
  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['patientFeedback'],
    queryFn: async () => {
      const response = await fetch('/api/patient/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      return response.json();
    },
    enabled: !!token
  });

  return (
    <PatientLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Patient Dashboard</h2>
        <Link href="/patient/appointments/new">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Book Appointment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Your Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <p className="text-sm text-gray-500">Loading appointments...</p>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments
                  .filter(app => app.status === 'Confirmed' || app.status === 'Pending')
                  .slice(0, 3)
                  .map(appointment => (
                    <div key={appointment.id} className="border-b pb-2 last:border-0">
                      <p className="font-medium">
                        {appointment.doctor.name.startsWith('Dr.')
                          ? appointment.doctor.name
                          : `Dr. ${appointment.doctor.name}`}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.specialization}</p>
                      <div className="flex items-center text-sm mt-1">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="mr-3">{formatDate(appointment.date)}</span>
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="mr-3">{appointment.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          appointment.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                <div className="pt-2">
                  <Link href="/patient/appointments">
                    <a className="text-sm text-primary hover:underline">View all appointments</a>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No upcoming appointments</p>
                <Link href="/patient/appointments/new">
                  <Button size="sm" variant="outline">Book an Appointment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageCircleHeart className="h-5 w-5 mr-2 text-primary" />
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackLoading ? (
              <p className="text-sm text-gray-500">Loading feedback...</p>
            ) : feedback && feedback.length > 0 ? (
              <div className="space-y-3">
                {feedback.slice(0, 3).map(fb => (
                  <div key={fb.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium">
                      {fb.appointment.doctor.name.startsWith('Dr.')
                        ? fb.appointment.doctor.name
                        : `Dr. ${fb.appointment.doctor.name}`}
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < fb.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{fb.comments}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(fb.date)}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/patient/feedback">
                    <a className="text-sm text-primary hover:underline">View all feedback</a>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No feedback provided yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/patient/appointments/new">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </Link>
            <Link href="/patient/appointments">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
            </Link>
            <Link href="/patient/profile">
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </PatientLayout>
  );
}
