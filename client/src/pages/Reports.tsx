import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Loader2 } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Reports() {
  // Fetch appointment data for reports
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['/api/appointments'],
  });

  // Fetch patient data for reports
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch doctor data for reports
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['/api/doctors'],
  });

  // Fetch feedback data for reports
  const { data: feedback, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['/api/feedback'],
  });

  const isLoading = 
    isLoadingAppointments || 
    isLoadingPatients || 
    isLoadingDoctors || 
    isLoadingFeedback;

  // Prepare data for appointment status chart
  const appointmentStatusData = React.useMemo(() => {
    if (!appointments) return null;
    
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Cancelled: 0
    };
    
    appointments.forEach(appointment => {
      statusCounts[appointment.status]++;
    });
    
    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Appointment Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(255, 159, 64, 0.6)',  // Pending - orange
            'rgba(75, 192, 192, 0.6)',  // Confirmed - green
            'rgba(255, 99, 132, 0.6)',  // Cancelled - red
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [appointments]);

  // Prepare data for doctor expertise distribution
  const expertiseDistributionData = React.useMemo(() => {
    if (!doctors) return null;
    
    const expertiseCounts = {};
    doctors.forEach(doctor => {
      if (!expertiseCounts[doctor.expertise]) {
        expertiseCounts[doctor.expertise] = 0;
      }
      expertiseCounts[doctor.expertise]++;
    });
    
    return {
      labels: Object.keys(expertiseCounts),
      datasets: [
        {
          label: 'Doctor Expertise',
          data: Object.values(expertiseCounts),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [doctors]);

  // Prepare data for monthly appointments trend
  const monthlyAppointmentData = React.useMemo(() => {
    if (!appointments) return null;
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlyCounts = Array(12).fill(0);
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.date);
      const month = date.getMonth();
      monthlyCounts[month]++;
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Appointments',
          data: monthlyCounts,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        },
      ],
    };
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Appointment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentStatusData ? (
              <div className="h-80">
                <Pie 
                  data={appointmentStatusData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-80">
                <p className="text-neutral-500">No appointment data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Doctor Expertise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {expertiseDistributionData ? (
              <div className="h-80">
                <Bar 
                  data={expertiseDistributionData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-80">
                <p className="text-neutral-500">No doctor data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Appointment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyAppointmentData ? (
            <div className="h-80">
              <Line 
                data={monthlyAppointmentData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-80">
              <p className="text-neutral-500">No appointment data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional reports could be added here */}
    </>
  );
}
