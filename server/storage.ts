import { db } from "@db";
import { 
  patients,
  doctors,
  appointments,
  schedules,
  feedback,
  admins,
  Patient,
  Doctor,
  Appointment,
  Schedule,
  Feedback,
  Admin
} from "@shared/schema";
import { eq, and, or, desc, gte, like, sql } from "drizzle-orm";
import { format } from "date-fns";

export const storage = {
  // Patient methods
  async getAllPatients(): Promise<Patient[]> {
    return await db.query.patients.findMany({
      orderBy: [desc(patients.id)]
    });
  },

  async getPatientById(id: number): Promise<Patient | undefined> {
    return await db.query.patients.findFirst({
      where: eq(patients.id, id)
    });
  },

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    return await db.query.patients.findFirst({
      where: eq(patients.email, email)
    });
  },

  async searchPatients(searchTerm: string, bloodGroup?: string): Promise<Patient[]> {
    const query = and(
      or(
        like(patients.name, `%${searchTerm}%`),
        like(patients.email, `%${searchTerm}%`),
        like(patients.phone, `%${searchTerm}%`)
      ),
      bloodGroup ? eq(patients.bloodGroup, bloodGroup) : sql`1=1`
    );

    return await db.query.patients.findMany({
      where: query,
      orderBy: [desc(patients.id)]
    });
  },

  async insertPatient(patient: Omit<Patient, "id">): Promise<Patient> {
    const [result] = await db.insert(patients).values(patient).returning();
    return result;
  },

  async updatePatient(id: number, patient: Partial<Omit<Patient, "id">>): Promise<Patient | undefined> {
    const [result] = await db.update(patients)
      .set(patient)
      .where(eq(patients.id, id))
      .returning();
    return result;
  },

  async deletePatient(id: number): Promise<boolean> {
    const [result] = await db.delete(patients)
      .where(eq(patients.id, id))
      .returning({ id: patients.id });
    return !!result;
  },

  // Doctor methods
  async getAllDoctors(): Promise<Doctor[]> {
    return await db.query.doctors.findMany({
      orderBy: [desc(doctors.id)]
    });
  },

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    return await db.query.doctors.findFirst({
      where: eq(doctors.id, id)
    });
  },

  async searchDoctors(searchTerm: string, expertise?: string): Promise<Doctor[]> {
    const query = and(
      or(
        like(doctors.name, `%${searchTerm}%`),
        like(doctors.phone, `%${searchTerm}%`)
      ),
      expertise ? eq(doctors.expertise, expertise) : sql`1=1`
    );

    return await db.query.doctors.findMany({
      where: query,
      orderBy: [desc(doctors.id)]
    });
  },

  async insertDoctor(doctor: Omit<Doctor, "id">): Promise<Doctor> {
    const [result] = await db.insert(doctors).values(doctor).returning();
    return result;
  },

  async updateDoctor(id: number, doctor: Partial<Omit<Doctor, "id">>): Promise<Doctor | undefined> {
    const [result] = await db.update(doctors)
      .set(doctor)
      .where(eq(doctors.id, id))
      .returning();
    return result;
  },

  async deleteDoctor(id: number): Promise<boolean> {
    const [result] = await db.delete(doctors)
      .where(eq(doctors.id, id))
      .returning({ id: doctors.id });
    return !!result;
  },

  // Appointment methods
  async getAllAppointments(): Promise<Appointment[]> {
    return await db.query.appointments.findMany({
      orderBy: [desc(appointments.date), desc(appointments.time)]
    });
  },

  async getAppointmentsWithRelations(): Promise<any[]> {
    return await db.query.appointments.findMany({
      with: {
        patient: true,
        doctor: true
      },
      orderBy: [desc(appointments.date), desc(appointments.time)]
    });
  },

  async getUpcomingAppointments(): Promise<any[]> {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');

    return await db.query.appointments.findMany({
      where: and(
        gte(appointments.date, formattedDate),
        eq(appointments.status, 'Confirmed')
      ),
      with: {
        patient: true,
        doctor: true
      },
      orderBy: [appointments.date, appointments.time],
      limit: 5
    });
  },

  async getAppointmentById(id: number): Promise<any | undefined> {
    return await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        patient: true,
        doctor: true
      }
    });
  },

  async getAppointmentsByPatientId(patientId: number): Promise<any[]> {
    return await db.query.appointments.findMany({
      where: eq(appointments.patientId, patientId),
      with: {
        doctor: true
      },
      orderBy: [desc(appointments.date), desc(appointments.time)]
    });
  },

  async getAppointmentsByDoctorId(doctorId: number): Promise<any[]> {
    return await db.query.appointments.findMany({
      where: eq(appointments.doctorId, doctorId),
      with: {
        patient: true
      },
      orderBy: [desc(appointments.date), desc(appointments.time)]
    });
  },

  async searchAppointments(searchTerm: string, status?: string): Promise<any[]> {
    return await db.query.appointments.findMany({
      with: {
        patient: true,
        doctor: true
      },
      where: and(
        or(
          status ? eq(appointments.status, status) : sql`1=1`
        )
      ),
      orderBy: [desc(appointments.date), desc(appointments.time)]
    });
  },

  async insertAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    const [result] = await db.insert(appointments).values(appointment).returning();
    
    // If the appointment is confirmed, create a schedule entry
    if (result.status === 'Confirmed' && result.patientId) {
      await db.insert(schedules).values({
        appointmentId: result.id,
        patientId: result.patientId
      });
    }
    
    return result;
  },

  async updateAppointment(id: number, appointment: Partial<Omit<Appointment, "id">>): Promise<Appointment | undefined> {
    const [result] = await db.update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    
    // Handle schedule updates based on status changes
    if (result.status === 'Confirmed' && result.patientId) {
      // Check if schedule already exists
      const existingSchedule = await db.query.schedules.findFirst({
        where: eq(schedules.appointmentId, id)
      });
      
      if (!existingSchedule) {
        // Create new schedule if doesn't exist
        await db.insert(schedules).values({
          appointmentId: id,
          patientId: result.patientId
        });
      }
    } else if (result.status === 'Cancelled') {
      // Remove from schedule if cancelled
      await db.delete(schedules)
        .where(eq(schedules.appointmentId, id));
    }
    
    return result;
  },

  async deleteAppointment(id: number): Promise<boolean> {
    // Delete related schedules first
    await db.delete(schedules)
      .where(eq(schedules.appointmentId, id));
    
    const [result] = await db.delete(appointments)
      .where(eq(appointments.id, id))
      .returning({ id: appointments.id });
    return !!result;
  },

  // Check if a doctor is available at the given time
  async isDoctorAvailable(doctorId: number, date: string, time: string, excludeAppointmentId?: number): Promise<boolean> {
    const query = and(
      eq(appointments.doctorId, doctorId),
      eq(appointments.date, date),
      eq(appointments.time, time),
      eq(appointments.status, 'Confirmed'),
      excludeAppointmentId ? sql`${appointments.id} != ${excludeAppointmentId}` : sql`1=1`
    );

    const conflictingAppointment = await db.query.appointments.findFirst({
      where: query
    });

    return !conflictingAppointment;
  },

  // Feedback methods
  async getAllFeedback(): Promise<any[]> {
    return await db.query.feedback.findMany({
      with: {
        appointment: {
          with: {
            patient: true,
            doctor: true
          }
        }
      },
      orderBy: [desc(feedback.date)]
    });
  },

  async getRecentFeedback(limit: number = 5): Promise<any[]> {
    return await db.query.feedback.findMany({
      with: {
        appointment: {
          with: {
            patient: true,
            doctor: true
          }
        }
      },
      orderBy: [desc(feedback.date)],
      limit
    });
  },

  async getFeedbackById(id: number): Promise<any | undefined> {
    return await db.query.feedback.findFirst({
      where: eq(feedback.id, id),
      with: {
        appointment: {
          with: {
            patient: true,
            doctor: true
          }
        }
      }
    });
  },

  async getFeedbackByAppointmentId(appointmentId: number): Promise<any[]> {
    return await db.query.feedback.findMany({
      where: eq(feedback.appointmentId, appointmentId),
      with: {
        appointment: {
          with: {
            patient: true,
            doctor: true
          }
        }
      }
    });
  },

  async getTopRatedDoctors(limit: number = 5): Promise<any[]> {
    // Get all doctors with their average ratings
    const doctorsWithRatings = await db.query.doctors.findMany({
      with: {
        appointments: {
          with: {
            feedback: true
          }
        }
      }
    });

    // Calculate average rating for each doctor
    const doctorsWithAverageRating = doctorsWithRatings.map(doctor => {
      let totalRating = 0;
      let count = 0;

      doctor.appointments.forEach(appointment => {
        appointment.feedback.forEach(fb => {
          if (fb.receiverType === 'Doctor' && fb.receiverId === doctor.id) {
            totalRating += fb.rating;
            count++;
          }
        });
      });

      const avgRating = count > 0 ? totalRating / count : 0;

      return {
        ...doctor,
        avgRating: avgRating,
        reviewCount: count
      };
    });

    // Sort by average rating (descending) and take the top ones
    return doctorsWithAverageRating
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  },

  async insertFeedback(feedbackData: Omit<Feedback, "id">): Promise<Feedback> {
    const [result] = await db.insert(feedback).values(feedbackData).returning();
    return result;
  },

  async updateFeedback(id: number, feedbackData: Partial<Omit<Feedback, "id">>): Promise<Feedback | undefined> {
    const [result] = await db.update(feedback)
      .set(feedbackData)
      .where(eq(feedback.id, id))
      .returning();
    return result;
  },

  async deleteFeedback(id: number): Promise<boolean> {
    const [result] = await db.delete(feedback)
      .where(eq(feedback.id, id))
      .returning({ id: feedback.id });
    return !!result;
  },

  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return await db.query.admins.findFirst({
      where: eq(admins.username, username)
    });
  },

  async insertAdmin(admin: Omit<Admin, "id">): Promise<Admin> {
    const [result] = await db.insert(admins).values(admin).returning();
    return result;
  },

  // Dashboard statistics
  async getDashboardStats(): Promise<any> {
    const [
      patientCount,
      doctorCount,
      todayAppointments,
      upcomingAppointments,
      feedbackAvg
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(patients),
      db.select({ count: sql<number>`count(*)` }).from(doctors),
      db.select({ count: sql<number>`count(*)` }).from(appointments)
        .where(eq(appointments.date, format(new Date(), 'yyyy-MM-dd'))),
      db.select({ count: sql<number>`count(*)` }).from(appointments)
        .where(and(
          gte(appointments.date, format(new Date(), 'yyyy-MM-dd')),
          eq(appointments.status, 'Confirmed')
        )),
      db.select({ avg: sql<number>`avg(rating)` }).from(feedback)
    ]);

    return {
      totalPatients: patientCount[0].count,
      totalDoctors: doctorCount[0].count,
      todayAppointments: todayAppointments[0].count,
      upcomingAppointments: upcomingAppointments[0].count,
      averageRating: feedbackAvg[0].avg ? parseFloat(feedbackAvg[0].avg.toFixed(1)) : 0
    };
  }
};
