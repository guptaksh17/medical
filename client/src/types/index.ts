import { 
  Patient, 
  Doctor, 
  Appointment, 
  Schedule, 
  Feedback,
  Admin
} from "@shared/schema";

// Common UI types
export interface StatusBadgeProps {
  status: "Pending" | "Confirmed" | "Cancelled";
  className?: string;
}

export interface RatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  maxValue?: number;
}

// Dashboard types
export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  upcomingAppointments: number;
  averageRating: number;
}

export interface TopDoctor extends Doctor {
  avgRating: number;
  reviewCount: number;
}

// Extended types with relations
export interface AppointmentWithRelations extends Appointment {
  patient: Patient;
  doctor: Doctor;
}

export interface FeedbackWithRelations extends Feedback {
  appointment: AppointmentWithRelations;
}

// Form types
export interface PatientFormValues {
  name: string;
  bloodGroup: string;
  dob: string;
  address: string;
  phone: string;
  email: string;
}

export interface DoctorFormValues {
  name: string;
  phone: string;
  address: string;
  expertise: string;
  experience: number;
  gender: string;
}

export interface AppointmentFormValues {
  patientId: number;
  doctorId: number;
  specialization: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

export interface FeedbackFormValues {
  appointmentId: number;
  givenBy: "Patient" | "Doctor";
  givenById: number;
  receiverId: number;
  receiverType: "Patient" | "Doctor";
  comments: string;
  rating: number;
}
