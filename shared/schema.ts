import { mysqlTable, text, serial, int, date, time, timestamp, boolean, primaryKey, varchar, mysqlEnum } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Define enum types as string literals for MySQL
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type PersonType = 'Patient' | 'Doctor';

// Patient Table
export const patients = mysqlTable('patients', {
  id: serial('id').primaryKey(), // Patient_ID in MySQL
  name: varchar('name', { length: 255 }),
  bloodGroup: varchar('blood_group', { length: 10 }),
  dob: date('dob'),
  address: text('address'),
  phone: varchar('phone', { length: 10 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
});

// Doctor Table
export const doctors = mysqlTable('doctors', {
  id: serial('id').primaryKey(), // Doctor_ID in MySQL
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 10 }),
  address: text('address'),
  expertise: varchar('expertise', { length: 100 }),
  experience: int('experience'),
  gender: varchar('gender', { length: 10 }),
});

// Appointment Table
export const appointments = mysqlTable('appointments', {
  id: serial('id').primaryKey(), // Appointment_ID in MySQL
  patientId: int('patient_id').references(() => patients.id), // Patient_ID in MySQL
  doctorId: int('doctor_id').references(() => doctors.id), // Doctor_ID in MySQL
  specialization: varchar('specialization', { length: 100 }),
  date: date('date'),
  time: time('time'),
  status: mysqlEnum('status', ['Pending', 'Confirmed', 'Completed', 'Cancelled']).default('Pending'),
});

// Schedule Table (Mapping Appointment and Patient)
export const schedules = mysqlTable('schedules', {
  appointmentId: int('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }),
  patientId: int('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.appointmentId, table.patientId] })
  };
});

// Feedback Table
export const feedback = mysqlTable('feedback', {
  id: serial('id').primaryKey(), // Feedback_ID in MySQL
  appointmentId: int('appointment_id').references(() => appointments.id),
  givenBy: mysqlEnum('given_by', ['Patient', 'Doctor']), // Given_By in MySQL
  givenById: int('given_by_id'), // Given_By_ID in MySQL
  receiverId: int('receiver_id'), // Receiver_ID in MySQL
  receiverType: mysqlEnum('receiver_type', ['Patient', 'Doctor']), // Receiver_Type in MySQL
  comments: text('comments'),
  rating: int('rating'),
  date: timestamp('date').defaultNow(), // Date in MySQL with DEFAULT CURRENT_TIMESTAMP
});

// Admin Table
export const admins = mysqlTable('admins', {
  id: serial('id').primaryKey(), // Admin_ID in MySQL
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // hashed password
});

// Define relations
export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  schedules: many(schedules),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  schedules: many(schedules),
  feedback: many(feedback),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  appointment: one(appointments, {
    fields: [schedules.appointmentId],
    references: [appointments.id],
  }),
  patient: one(patients, {
    fields: [schedules.patientId],
    references: [patients.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  appointment: one(appointments, {
    fields: [feedback.appointmentId],
    references: [appointments.id],
  }),
}));

// Validation schemas
export const patientInsertSchema = createInsertSchema(patients, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  phone: (schema) => schema.min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits")
    .regex(/^[0-9]{10}$/, "Phone must contain only digits"),
  email: (schema) => schema.email("Please provide a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const doctorInsertSchema = createInsertSchema(doctors, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  phone: (schema) => schema.min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits")
    .regex(/^[0-9]{10}$/, "Phone must contain only digits"),
  expertise: (schema) => schema.min(2, "Expertise must be at least 2 characters"),
  experience: (schema) => schema.min(0, "Experience cannot be negative"),
});

export const appointmentInsertSchema = createInsertSchema(appointments, {
  patientId: (schema) => schema.min(1, "Patient is required"),
  doctorId: (schema) => schema.min(1, "Doctor is required"),
  date: (schema) => schema,
  time: (schema) => schema,
  status: (schema) => schema.refine(val => ['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(val), {
    message: "Status must be one of: Pending, Confirmed, Completed, Cancelled"
  }),
});

export const feedbackInsertSchema = createInsertSchema(feedback, {
  rating: (schema) => schema.min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  givenBy: (schema) => schema.refine(val => ['Patient', 'Doctor'].includes(val), {
    message: "Given By must be either Patient or Doctor"
  }),
  receiverType: (schema) => schema.refine(val => ['Patient', 'Doctor'].includes(val), {
    message: "Receiver Type must be either Patient or Doctor"
  }),
});

export const adminInsertSchema = createInsertSchema(admins, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

// Types
export type Patient = typeof patients.$inferSelect;
export type PatientInsert = z.infer<typeof patientInsertSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type DoctorInsert = z.infer<typeof doctorInsertSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type AppointmentInsert = z.infer<typeof appointmentInsertSchema>;

export type Schedule = typeof schedules.$inferSelect;

export type Feedback = typeof feedback.$inferSelect;
export type FeedbackInsert = z.infer<typeof feedbackInsertSchema>;

export type Admin = typeof admins.$inferSelect;
export type AdminInsert = z.infer<typeof adminInsertSchema>;

// Type for Appointment with related entities
export type AppointmentWithRelations = Appointment & {
  patient: Patient;
  doctor: Doctor;
};

// Type for Feedback with related entities
export type FeedbackWithRelations = Feedback & {
  appointment: AppointmentWithRelations;
};
