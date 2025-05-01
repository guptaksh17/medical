import { pgTable, text, serial, integer, date, time, timestamp, boolean, primaryKey, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Create enum type for appointment status
export const appointmentStatusEnum = pgEnum('appointment_status', ['Pending', 'Confirmed', 'Cancelled']);

// Create enum type for feedback giver and receiver
export const personTypeEnum = pgEnum('person_type', ['Patient', 'Doctor']);

// Patient Table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  bloodGroup: varchar('blood_group', { length: 10 }),
  dob: date('dob'),
  address: text('address'),
  phone: varchar('phone', { length: 10 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});

// Doctor Table
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 10 }).notNull(),
  address: text('address'),
  expertise: varchar('expertise', { length: 100 }).notNull(),
  experience: integer('experience').notNull(),
  gender: varchar('gender', { length: 10 }),
});

// Appointment Table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id),
  doctorId: integer('doctor_id').references(() => doctors.id),
  specialization: varchar('specialization', { length: 100 }),
  date: date('date').notNull(),
  time: time('time').notNull(),
  status: appointmentStatusEnum('status').default('Pending'),
});

// Schedule Table (Mapping Appointment and Patient)
export const schedules = pgTable('schedules', {
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.appointmentId, table.patientId] })
  };
});

// Feedback Table
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').references(() => appointments.id),
  givenBy: personTypeEnum('given_by').notNull(),
  givenById: integer('given_by_id').notNull(),
  receiverId: integer('receiver_id').notNull(),
  receiverType: personTypeEnum('receiver_type').notNull(),
  comments: text('comments'),
  rating: integer('rating').notNull(),
  date: timestamp('date').defaultNow().notNull(),
});

// Admin Table
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
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
  phone: (schema) => schema.min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits"),
  email: (schema) => schema.email("Please provide a valid email"),
});

export const doctorInsertSchema = createInsertSchema(doctors, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  phone: (schema) => schema.min(10, "Phone must be at least 10 digits").max(10, "Phone cannot exceed 10 digits"),
  expertise: (schema) => schema.min(2, "Expertise must be at least 2 characters"),
  experience: (schema) => schema.min(0, "Experience cannot be negative"),
});

export const appointmentInsertSchema = createInsertSchema(appointments, {
  patientId: (schema) => schema.min(1, "Patient is required"),
  doctorId: (schema) => schema.min(1, "Doctor is required"),
  date: (schema) => schema,
  time: (schema) => schema,
});

export const feedbackInsertSchema = createInsertSchema(feedback, {
  rating: (schema) => schema.min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
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
