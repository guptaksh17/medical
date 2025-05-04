import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  patientInsertSchema,
  doctorInsertSchema,
  appointmentInsertSchema,
  feedbackInsertSchema,
  adminInsertSchema
} from "@shared/schema";
import { authenticateJWT, adminLogin, patientLogin, hashPassword } from "./auth";
import dashboardController from "./controllers/dashboardController";

export async function registerRoutes(app: Express): Promise<Server> {
  // All API routes are prefixed with /api
  const apiPrefix = '/api';

  // Authentication routes
  app.post(`${apiPrefix}/auth/admin/login`, adminLogin);
  app.post(`${apiPrefix}/auth/patient/login`, patientLogin);

  // Admin registration
  app.post(`${apiPrefix}/auth/admin/register`, async (req, res) => {
    try {
      const validatedData = adminInsertSchema.parse(req.body);

      // Check if admin with username already exists
      const existingAdmin = await storage.getAdminByUsername(validatedData.username);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create new admin
      const newAdmin = await storage.insertAdmin({
        ...validatedData,
        password: hashedPassword
      });

      res.status(201).json({
        message: 'Admin registered successfully',
        admin: { id: newAdmin.id, username: newAdmin.username }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error registering admin:', error);
      res.status(500).json({ message: 'Failed to register admin' });
    }
  });

  // Patient registration
  app.post(`${apiPrefix}/auth/patient/register`, async (req, res) => {
    try {
      const validatedData = patientInsertSchema.parse(req.body);

      // Check if patient with email already exists
      const existingPatient = await storage.getPatientByEmail(validatedData.email);
      if (existingPatient) {
        return res.status(400).json({ message: 'A patient with this email already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create new patient
      const newPatient = await storage.insertPatient({
        ...validatedData,
        password: hashedPassword
      });

      res.status(201).json({
        message: 'Patient registered successfully',
        patient: {
          id: newPatient.id,
          name: newPatient.name,
          email: newPatient.email
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error registering patient:', error);
      res.status(500).json({ message: 'Failed to register patient' });
    }
  });

  // Patients API Endpoints
  app.get(`${apiPrefix}/patients`, authenticateJWT, async (req, res) => {
    try {
      let patients;
      const { search, bloodGroup } = req.query;

      if (search) {
        patients = await storage.searchPatients(search as string, bloodGroup as string);
      } else {
        patients = await storage.getAllPatients();
      }

      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Failed to fetch patients' });
    }
  });

  app.get(`${apiPrefix}/patients/:id`, authenticateJWT, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }

      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ message: 'Failed to fetch patient' });
    }
  });

  app.post(`${apiPrefix}/patients`, authenticateJWT, async (req, res) => {
    try {
      const validatedData = patientInsertSchema.parse(req.body);

      // Check if patient with email already exists
      const existingPatient = await storage.getPatientByEmail(validatedData.email);
      if (existingPatient) {
        return res.status(400).json({ message: 'A patient with this email already exists' });
      }

      const newPatient = await storage.insertPatient(validatedData);
      res.status(201).json(newPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating patient:', error);
      res.status(500).json({ message: 'Failed to create patient' });
    }
  });

  app.put(`${apiPrefix}/patients/:id`, authenticateJWT, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }

      // First check if the patient exists
      const existingPatient = await storage.getPatientById(patientId);
      if (!existingPatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Validate the data
      const validatedData = patientInsertSchema.parse(req.body);

      // Check if email is being changed and if it conflicts with another patient
      if (validatedData.email !== existingPatient.email) {
        const patientWithEmail = await storage.getPatientByEmail(validatedData.email);
        if (patientWithEmail && patientWithEmail.id !== patientId) {
          return res.status(400).json({ message: 'A patient with this email already exists' });
        }
      }

      const updatedPatient = await storage.updatePatient(patientId, validatedData);
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating patient:', error);
      res.status(500).json({ message: 'Failed to update patient' });
    }
  });

  app.delete(`${apiPrefix}/patients/:id`, authenticateJWT, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }

      const success = await storage.deletePatient(patientId);
      if (!success) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ message: 'Failed to delete patient' });
    }
  });

  // Doctors API Endpoints
  app.get(`${apiPrefix}/doctors`, authenticateJWT, async (req, res) => {
    try {
      let doctors;
      const { search, expertise } = req.query;

      if (search) {
        doctors = await storage.searchDoctors(search as string, expertise as string);
      } else {
        doctors = await storage.getAllDoctors();
      }

      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ message: 'Failed to fetch doctors' });
    }
  });

  app.get(`${apiPrefix}/doctors/:id`, authenticateJWT, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
      }

      const doctor = await storage.getDoctorById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      res.json(doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      res.status(500).json({ message: 'Failed to fetch doctor' });
    }
  });

  app.post(`${apiPrefix}/doctors`, authenticateJWT, async (req, res) => {
    try {
      const validatedData = doctorInsertSchema.parse(req.body);
      const newDoctor = await storage.insertDoctor(validatedData);
      res.status(201).json(newDoctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating doctor:', error);
      res.status(500).json({ message: 'Failed to create doctor' });
    }
  });

  app.put(`${apiPrefix}/doctors/:id`, authenticateJWT, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
      }

      // First check if the doctor exists
      const existingDoctor = await storage.getDoctorById(doctorId);
      if (!existingDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Validate the data
      const validatedData = doctorInsertSchema.parse(req.body);

      const updatedDoctor = await storage.updateDoctor(doctorId, validatedData);
      res.json(updatedDoctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating doctor:', error);
      res.status(500).json({ message: 'Failed to update doctor' });
    }
  });

  app.delete(`${apiPrefix}/doctors/:id`, authenticateJWT, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
      }

      const success = await storage.deleteDoctor(doctorId);
      if (!success) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ message: 'Failed to delete doctor' });
    }
  });

  // Appointments API Endpoints
  app.get(`${apiPrefix}/appointments`, authenticateJWT, async (req, res) => {
    try {
      let appointments;
      const { search, status } = req.query;

      if (search || status) {
        appointments = await storage.searchAppointments(search as string, status as string);
      } else {
        appointments = await storage.getAppointmentsWithRelations();
      }

      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get(`${apiPrefix}/appointments/upcoming`, authenticateJWT, async (req, res) => {
    try {
      const appointments = await storage.getUpcomingAppointments();
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      res.status(500).json({ message: 'Failed to fetch upcoming appointments' });
    }
  });

  app.get(`${apiPrefix}/appointments/:id`, authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.json(appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ message: 'Failed to fetch appointment' });
    }
  });

  app.get(`${apiPrefix}/appointments/patient/:patientId`, authenticateJWT, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }

      const appointments = await storage.getAppointmentsByPatientId(patientId);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({ message: 'Failed to fetch patient appointments' });
    }
  });

  app.get(`${apiPrefix}/appointments/doctor/:doctorId`, authenticateJWT, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
      }

      const appointments = await storage.getAppointmentsByDoctorId(doctorId);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      res.status(500).json({ message: 'Failed to fetch doctor appointments' });
    }
  });

  app.post(`${apiPrefix}/appointments`, authenticateJWT, async (req, res) => {
    try {
      const validatedData = appointmentInsertSchema.parse(req.body);

      // Check if doctor is available at the given time
      const isDoctorAvailable = await storage.isDoctorAvailable(
        validatedData.doctorId,
        validatedData.date.toString(),
        validatedData.time.toString()
      );

      if (!isDoctorAvailable && validatedData.status === 'Confirmed') {
        return res.status(400).json({
          message: 'Doctor is not available at the selected time. Please choose a different time.'
        });
      }

      const newAppointment = await storage.insertAppointment(validatedData);
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Failed to create appointment' });
    }
  });

  app.put(`${apiPrefix}/appointments/:id`, authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      // First check if the appointment exists
      const existingAppointment = await storage.getAppointmentById(appointmentId);
      if (!existingAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Validate the data
      const validatedData = appointmentInsertSchema.parse(req.body);

      // Check if doctor is available at the given time if changing to confirmed status
      if (
        validatedData.status === 'Confirmed' &&
        (
          validatedData.doctorId !== existingAppointment.doctorId ||
          validatedData.date !== existingAppointment.date ||
          validatedData.time !== existingAppointment.time
        )
      ) {
        const isDoctorAvailable = await storage.isDoctorAvailable(
          validatedData.doctorId,
          validatedData.date.toString(),
          validatedData.time.toString(),
          appointmentId
        );

        if (!isDoctorAvailable) {
          return res.status(400).json({
            message: 'Doctor is not available at the selected time. Please choose a different time.'
          });
        }
      }

      const updatedAppointment = await storage.updateAppointment(appointmentId, validatedData);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: 'Failed to update appointment' });
    }
  });

  app.delete(`${apiPrefix}/appointments/:id`, authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      const success = await storage.deleteAppointment(appointmentId);
      if (!success) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Failed to delete appointment' });
    }
  });

  // Feedback API Endpoints
  app.get(`${apiPrefix}/feedback`, authenticateJWT, async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Failed to fetch feedback' });
    }
  });

  app.get(`${apiPrefix}/feedback/recent`, authenticateJWT, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const feedback = await storage.getRecentFeedback(limit);
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching recent feedback:', error);
      res.status(500).json({ message: 'Failed to fetch recent feedback' });
    }
  });

  app.get(`${apiPrefix}/feedback/:id`, authenticateJWT, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      if (isNaN(feedbackId)) {
        return res.status(400).json({ message: 'Invalid feedback ID' });
      }

      const feedback = await storage.getFeedbackById(feedbackId);
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Failed to fetch feedback' });
    }
  });

  app.get(`${apiPrefix}/feedback/appointment/:appointmentId`, authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      const feedback = await storage.getFeedbackByAppointmentId(appointmentId);
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching appointment feedback:', error);
      res.status(500).json({ message: 'Failed to fetch appointment feedback' });
    }
  });

  app.get(`${apiPrefix}/doctors/top-rated`, authenticateJWT, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const doctors = await storage.getTopRatedDoctors(limit);
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching top rated doctors:', error);
      res.status(500).json({ message: 'Failed to fetch top rated doctors' });
    }
  });

  app.post(`${apiPrefix}/feedback`, authenticateJWT, async (req, res) => {
    try {
      const validatedData = feedbackInsertSchema.parse(req.body);
      const newFeedback = await storage.insertFeedback(validatedData);
      res.status(201).json(newFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: 'Failed to create feedback' });
    }
  });

  app.put(`${apiPrefix}/feedback/:id`, authenticateJWT, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      if (isNaN(feedbackId)) {
        return res.status(400).json({ message: 'Invalid feedback ID' });
      }

      // Validate the data
      const validatedData = feedbackInsertSchema.parse(req.body);

      const updatedFeedback = await storage.updateFeedback(feedbackId, validatedData);
      if (!updatedFeedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      res.json(updatedFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating feedback:', error);
      res.status(500).json({ message: 'Failed to update feedback' });
    }
  });

  app.delete(`${apiPrefix}/feedback/:id`, authenticateJWT, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      if (isNaN(feedbackId)) {
        return res.status(400).json({ message: 'Invalid feedback ID' });
      }

      const success = await storage.deleteFeedback(feedbackId);
      if (!success) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ message: 'Failed to delete feedback' });
    }
  });

  // Dashboard Statistics
  app.get(`${apiPrefix}/dashboard/stats`, authenticateJWT, dashboardController.getDashboardStats);

  // Patient-specific API Endpoints
  app.get(`${apiPrefix}/patient/appointments`, authenticateJWT, async (req, res) => {
    try {
      // @ts-ignore - we know req.user exists from JWT auth
      const patientId = req.user.id;
      const { search, status } = req.query;

      // Get appointments for this patient
      let appointments = await storage.getAppointmentsByPatientId(patientId);

      // Apply filters if provided
      if (status && status !== 'all') {
        appointments = appointments.filter(app => app.status === status);
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        appointments = appointments.filter(app =>
          app.doctor.name.toLowerCase().includes(searchTerm) ||
          app.specialization?.toLowerCase().includes(searchTerm)
        );
      }

      res.json(appointments);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get(`${apiPrefix}/patient/appointments/:id`, authenticateJWT, async (req, res) => {
    try {
      // @ts-ignore - we know req.user exists from JWT auth
      const patientId = req.user.id;
      const appointmentId = parseInt(req.params.id);

      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }

      // Get the appointment
      const appointment = await storage.getAppointmentById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Verify this appointment belongs to the authenticated patient
      if (appointment.patientId !== patientId) {
        return res.status(403).json({ message: 'You do not have permission to view this appointment' });
      }

      res.json(appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ message: 'Failed to fetch appointment' });
    }
  });

  app.post(`${apiPrefix}/patient/appointments`, authenticateJWT, async (req, res) => {
    try {
      // @ts-ignore - we know req.user exists from JWT auth
      const patientId = req.user.id;

      // Add patient ID to the appointment data
      const appointmentData = {
        ...req.body,
        patientId,
        status: 'Pending' // Patient-created appointments start as pending
      };

      // Validate the data
      const validatedData = appointmentInsertSchema.parse(appointmentData);

      // Check if doctor is available at the given time
      const isDoctorAvailable = await storage.isDoctorAvailable(
        validatedData.doctorId,
        validatedData.date.toString(),
        validatedData.time.toString()
      );

      if (!isDoctorAvailable) {
        return res.status(400).json({
          message: 'Doctor is not available at the selected time. Please choose a different time.'
        });
      }

      const newAppointment = await storage.insertAppointment(validatedData);
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Failed to create appointment' });
    }
  });

  app.get(`${apiPrefix}/patient/feedback`, authenticateJWT, async (req, res) => {
    try {
      // @ts-ignore - we know req.user exists from JWT auth
      const patientId = req.user.id;

      // Get all feedback
      const allFeedback = await storage.getAllFeedback();

      // Filter to only include feedback given by this patient
      const patientFeedback = allFeedback.filter(
        fb => fb.givenBy === 'Patient' && fb.givenById === patientId
      );

      res.json(patientFeedback);
    } catch (error) {
      console.error('Error fetching patient feedback:', error);
      res.status(500).json({ message: 'Failed to fetch feedback' });
    }
  });

  app.post(`${apiPrefix}/patient/feedback`, authenticateJWT, async (req, res) => {
    try {
      // @ts-ignore - we know req.user exists from JWT auth
      const patientId = req.user.id;

      // Add patient ID to the feedback data
      const feedbackData = {
        ...req.body,
        givenBy: 'Patient',
        givenById: patientId
      };

      // Validate the data
      const validatedData = feedbackInsertSchema.parse(feedbackData);

      // Verify this appointment belongs to the authenticated patient
      const appointment = await storage.getAppointmentById(validatedData.appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.patientId !== patientId) {
        return res.status(403).json({ message: 'You do not have permission to provide feedback for this appointment' });
      }

      const newFeedback = await storage.insertFeedback(validatedData);
      res.status(201).json(newFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: 'Failed to create feedback' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
