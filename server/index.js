import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './db.js';
import routes from './routes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add headers for Safari
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Test database connection
testConnection()
  .then(connected => {
    if (!connected) {
      console.error('Failed to connect to the database. Exiting...');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

// Import the query function and auth middleware directly
import { query } from './db.js';
import { authenticateJWT } from './auth.js';
import dashboardController from './controllers/dashboardController.js';
import dashboardStats from './dashboardStats.js';

// Routes
app.use(routes);

// Test endpoint that doesn't require database access
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({
    message: 'Server is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Simplified dashboard stats endpoint with static data
app.get('/api/dashboard/stats', authenticateJWT, (req, res) => {
  console.log('Simplified dashboard stats endpoint called');

  // Return static data for now to get the UI working
  const stats = {
    totalPatients: 5,
    totalDoctors: 5,
    todayAppointments: 2,
    upcomingAppointments: 3,
    averageRating: 4.5
  };

  console.log('Sending static dashboard stats:', stats);
  res.json(stats);
});

// Patient-specific routes
// Get patient appointments
app.get('/api/patient/appointments', authenticateJWT, async (req, res) => {
  try {
    // Get the patient ID from the JWT token
    const patientId = req.user.id;

    // Only fetch appointments for this specific patient
    const appointments = await query(`
      SELECT a.*, d.Name as DoctorName, d.Expertise, d.Experience
      FROM Appointment a
      JOIN Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE a.Patient_ID = ?
      ORDER BY a.Date DESC, a.Time DESC
    `, [patientId]);

    // Map to the expected format
    const formattedAppointments = appointments.map(app => ({
      id: app.Appointment_ID,
      patientId: app.Patient_ID,
      doctorId: app.Doctor_ID,
      date: app.Date,
      time: app.Time,
      status: app.Status,
      specialization: app.Specialization,
      doctor: {
        id: app.Doctor_ID,
        name: app.DoctorName,
        expertise: app.Expertise,
        experience: app.Experience
      }
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Get patient feedback
app.get('/api/patient/feedback', authenticateJWT, async (req, res) => {
  try {
    // Get the patient ID from the JWT token
    const patientId = req.user.id;

    // Only fetch feedback given by this specific patient
    const feedback = await query(`
      SELECT f.*, a.Date as AppointmentDate, a.Time, a.Specialization,
             d.Name as DoctorName, d.Expertise
      FROM Feedback f
      JOIN Appointment a ON f.Appointment_ID = a.Appointment_ID
      JOIN Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE a.Patient_ID = ?
      ORDER BY f.Date DESC
    `, [patientId]);

    // Map to the expected format
    const formattedFeedback = feedback.map(fb => ({
      id: fb.Feedback_ID,
      appointmentId: fb.Appointment_ID,
      rating: fb.Rating,
      comments: fb.Comments,
      date: fb.Date,
      appointment: {
        id: fb.Appointment_ID,
        date: fb.AppointmentDate,
        time: fb.Time,
        specialization: fb.Specialization,
        doctor: {
          id: fb.Doctor_ID,
          name: fb.DoctorName,
          expertise: fb.Expertise
        }
      }
    }));

    res.json(formattedFeedback);
  } catch (error) {
    console.error('Error fetching patient feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Direct route for updating appointment status
app.put('/api/update-status/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Direct status update request received:', { id, status });

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Check if appointment exists
    const appointments = await query('SELECT * FROM Appointment WHERE Appointment_ID = ?', [id]);
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update the status
    await query('UPDATE Appointment SET Status = ? WHERE Appointment_ID = ?', [status, id]);

    // Get the updated appointment
    const updatedAppointments = await query('SELECT * FROM Appointment WHERE Appointment_ID = ?', [id]);
    const appointment = updatedAppointments[0];

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: {
        id: appointment.Appointment_ID,
        status: appointment.Status
      }
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
