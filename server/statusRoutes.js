import express from 'express';
import { authenticateJWT } from './auth.js';
import { query } from './db.js';

const router = express.Router();

// API prefix
const apiPrefix = '/api';

// Direct status update route
router.put(`${apiPrefix}/appointments/:id/status`, authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('Status update request received:', { id, status });
    
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

export default router;
