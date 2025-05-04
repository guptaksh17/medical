import express from 'express';
import { authenticateJWT } from './auth.js';
import patientController from './controllers/patientController.js';
import doctorController from './controllers/doctorController.js';
import appointmentController from './controllers/appointmentController.js';
import feedbackController from './controllers/feedbackController.js';
import adminController from './controllers/adminController.js';
import dashboardController from './controllers/dashboardController.js';

const router = express.Router();

// API prefix
const apiPrefix = '/api';

// Auth routes
router.post(`${apiPrefix}/auth/login`, adminController.login);
router.post(`${apiPrefix}/auth/register`, adminController.register);

// Patient auth routes
router.post(`${apiPrefix}/auth/patient/login`, patientController.login);
router.post(`${apiPrefix}/auth/patient/register`, patientController.register);

// Patient routes
router.get(`${apiPrefix}/patients`, authenticateJWT, patientController.getAllPatients);
router.get(`${apiPrefix}/patients/search`, authenticateJWT, patientController.searchPatients);
router.get(`${apiPrefix}/patients/:id`, authenticateJWT, patientController.getPatientById);
router.post(`${apiPrefix}/patients`, authenticateJWT, patientController.createPatient);
router.put(`${apiPrefix}/patients/:id`, authenticateJWT, patientController.updatePatient);
router.delete(`${apiPrefix}/patients/:id`, authenticateJWT, patientController.deletePatient);

// Doctor routes
router.get(`${apiPrefix}/doctors`, authenticateJWT, doctorController.getAllDoctors);
router.get(`${apiPrefix}/doctors/search`, authenticateJWT, doctorController.searchDoctors);
router.get(`${apiPrefix}/doctors/top-rated`, authenticateJWT, doctorController.getTopRatedDoctors);
router.get(`${apiPrefix}/doctors/:id`, authenticateJWT, doctorController.getDoctorById);
router.post(`${apiPrefix}/doctors`, authenticateJWT, doctorController.createDoctor);
router.put(`${apiPrefix}/doctors/:id`, authenticateJWT, doctorController.updateDoctor);
router.delete(`${apiPrefix}/doctors/:id`, authenticateJWT, doctorController.deleteDoctor);

// Appointment routes
router.get(`${apiPrefix}/appointments`, authenticateJWT, appointmentController.getAllAppointments);
router.get(`${apiPrefix}/appointments/upcoming`, authenticateJWT, appointmentController.getUpcomingAppointments);
router.get(`${apiPrefix}/appointments/patient/:patientId`, authenticateJWT, appointmentController.getAppointmentsByPatientId);
router.get(`${apiPrefix}/appointments/doctor/:doctorId`, authenticateJWT, appointmentController.getAppointmentsByDoctorId);
router.get(`${apiPrefix}/appointments/:id`, authenticateJWT, appointmentController.getAppointmentById);
router.post(`${apiPrefix}/appointments`, authenticateJWT, appointmentController.createAppointment);
router.put(`${apiPrefix}/appointments/:id`, authenticateJWT, appointmentController.updateAppointment);
router.delete(`${apiPrefix}/appointments/:id`, authenticateJWT, appointmentController.deleteAppointment);

// Feedback routes
router.get(`${apiPrefix}/feedback`, authenticateJWT, feedbackController.getAllFeedback);
router.get(`${apiPrefix}/feedback/recent`, authenticateJWT, feedbackController.getRecentFeedback);
router.get(`${apiPrefix}/feedback/patient/:patientId`, authenticateJWT, feedbackController.getFeedbackByPatientId);
router.get(`${apiPrefix}/feedback/appointment/:appointmentId`, authenticateJWT, feedbackController.getFeedbackByAppointmentId);
router.get(`${apiPrefix}/feedback/:id`, authenticateJWT, feedbackController.getFeedbackById);
router.post(`${apiPrefix}/feedback`, authenticateJWT, feedbackController.createFeedback);
router.put(`${apiPrefix}/feedback/:id`, authenticateJWT, feedbackController.updateFeedback);
router.delete(`${apiPrefix}/feedback/:id`, authenticateJWT, feedbackController.deleteFeedback);

// Dashboard routes
router.get(`${apiPrefix}/dashboard/stats`, authenticateJWT, dashboardController.getDashboardStats);

export default router;
