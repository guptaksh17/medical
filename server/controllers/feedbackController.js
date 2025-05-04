import { query } from '../db.js';

// Get all feedback
export async function getAllFeedback(req, res) {
  try {
    const feedback = await query(`
      SELECT
        f.*,
        a.Appointment_ID as AppointmentID,
        a.Patient_ID as PatientID,
        a.Doctor_ID as DoctorID,
        a.Specialization as AppointmentSpecialization,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime,
        a.Status as AppointmentStatus,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      ORDER BY
        f.Date DESC
    `);

    // Transform the data to match the frontend's expected format
    const transformedFeedback = feedback.map(item => ({
      id: item.Feedback_ID,
      appointmentId: item.Appointment_ID,
      givenBy: item.Given_By,
      givenById: item.Given_By_ID,
      receiverId: item.Receiver_ID,
      receiverType: item.Receiver_Type,
      comments: item.Comments,
      rating: item.Rating,
      date: item.Date,
      appointment: {
        id: item.AppointmentID,
        patientId: item.PatientID,
        doctorId: item.DoctorID,
        specialization: item.AppointmentSpecialization,
        date: item.AppointmentDate,
        time: item.AppointmentTime,
        status: item.AppointmentStatus,
        patient: {
          id: item.PatientID,
          name: item.PatientName,
          bloodGroup: item.PatientBloodGroup,
          email: item.PatientEmail,
          phone: item.PatientPhone
        },
        doctor: {
          id: item.DoctorID,
          name: item.DoctorName,
          expertise: item.DoctorExpertise,
          phone: item.DoctorPhone
        }
      }
    }));

    res.json(transformedFeedback);
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ message: 'Failed to get feedback' });
  }
}

// Get feedback by ID
export async function getFeedbackById(req, res) {
  try {
    const { id } = req.params;

    const [feedback] = await query(`
      SELECT
        f.*,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime,
        p.Name as PatientName,
        d.Name as DoctorName
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        f.Feedback_ID = ?
    `, [id]);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ message: 'Failed to get feedback' });
  }
}

// Get recent feedback
export async function getRecentFeedback(req, res) {
  try {
    const limit = req.query.limit || 5;

    const feedback = await query(`
      SELECT
        f.*,
        a.Appointment_ID as AppointmentID,
        a.Patient_ID as PatientID,
        a.Doctor_ID as DoctorID,
        a.Specialization as AppointmentSpecialization,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime,
        a.Status as AppointmentStatus,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      ORDER BY
        f.Date DESC
      LIMIT ?
    `, [parseInt(limit)]);

    // Transform the data to match the frontend's expected format
    const transformedFeedback = feedback.map(item => ({
      id: item.Feedback_ID,
      appointmentId: item.Appointment_ID,
      givenBy: item.Given_By,
      givenById: item.Given_By_ID,
      receiverId: item.Receiver_ID,
      receiverType: item.Receiver_Type,
      comments: item.Comments,
      rating: item.Rating,
      date: item.Date,
      appointment: {
        id: item.AppointmentID,
        patientId: item.PatientID,
        doctorId: item.DoctorID,
        specialization: item.AppointmentSpecialization,
        date: item.AppointmentDate,
        time: item.AppointmentTime,
        status: item.AppointmentStatus,
        patient: {
          id: item.PatientID,
          name: item.PatientName,
          bloodGroup: item.PatientBloodGroup,
          email: item.PatientEmail,
          phone: item.PatientPhone
        },
        doctor: {
          id: item.DoctorID,
          name: item.DoctorName,
          expertise: item.DoctorExpertise,
          phone: item.DoctorPhone
        }
      }
    }));

    res.json(transformedFeedback);
  } catch (error) {
    console.error('Error getting recent feedback:', error);
    res.status(500).json({ message: 'Failed to get recent feedback' });
  }
}

// Get feedback by patient ID
export async function getFeedbackByPatientId(req, res) {
  try {
    const { patientId } = req.params;
    console.log('Getting feedback for patient ID:', patientId);

    const feedback = await query(`
      SELECT
        f.*,
        a.Appointment_ID as AppointmentID,
        a.Patient_ID as PatientID,
        a.Doctor_ID as DoctorID,
        a.Specialization as AppointmentSpecialization,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime,
        a.Status as AppointmentStatus,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Patient_ID = ? AND f.Given_By = 'Patient'
      ORDER BY
        f.Date DESC
    `, [patientId]);

    console.log(`Found ${feedback.length} feedback entries for patient ${patientId}`);

    // Transform the data to match the frontend's expected format
    const transformedFeedback = feedback.map(item => ({
      id: item.Feedback_ID,
      appointmentId: item.Appointment_ID,
      givenBy: item.Given_By,
      givenById: item.Given_By_ID,
      receiverId: item.Receiver_ID,
      receiverType: item.Receiver_Type,
      comments: item.Comments,
      rating: item.Rating,
      date: item.Date,
      appointment: {
        id: item.AppointmentID,
        patientId: item.PatientID,
        doctorId: item.DoctorID,
        specialization: item.AppointmentSpecialization,
        date: item.AppointmentDate,
        time: item.AppointmentTime,
        status: item.AppointmentStatus,
        patient: {
          id: item.PatientID,
          name: item.PatientName,
          bloodGroup: item.PatientBloodGroup,
          email: item.PatientEmail,
          phone: item.PatientPhone
        },
        doctor: {
          id: item.DoctorID,
          name: item.DoctorName,
          expertise: item.DoctorExpertise,
          phone: item.DoctorPhone
        }
      }
    }));

    res.json(transformedFeedback);
  } catch (error) {
    console.error('Error getting patient feedback:', error);
    res.status(500).json({ message: 'Failed to get patient feedback' });
  }
}

// Get feedback by appointment ID
export async function getFeedbackByAppointmentId(req, res) {
  try {
    const { appointmentId } = req.params;

    const feedback = await query(`
      SELECT
        f.*,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime,
        p.Name as PatientName,
        d.Name as DoctorName
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        f.Appointment_ID = ?
      ORDER BY
        f.Date DESC
    `, [appointmentId]);

    res.json(feedback);
  } catch (error) {
    console.error('Error getting appointment feedback:', error);
    res.status(500).json({ message: 'Failed to get appointment feedback' });
  }
}

// Create feedback
export async function createFeedback(req, res) {
  try {
    console.log('Creating feedback with data:', req.body);

    // Handle both camelCase and snake_case field names
    const appointmentId = req.body.appointmentId || req.body.Appointment_ID;
    const givenBy = req.body.givenBy || req.body.Given_By;
    const givenById = req.body.givenById || req.body.Given_By_ID;
    const receiverId = req.body.receiverId || req.body.Receiver_ID;
    const receiverType = req.body.receiverType || req.body.Receiver_Type;
    const comments = req.body.comments || req.body.Comments;
    const rating = req.body.rating || req.body.Rating;

    console.log('Parsed fields:', {
      appointmentId, givenBy, givenById, receiverId, receiverType, comments, rating
    });

    // Validate required fields
    if (!appointmentId || !givenBy || !givenById || !receiverId || !receiverType || !rating) {
      return res.status(400).json({
        message: 'Appointment, Given By, Given By ID, Receiver ID, Receiver Type, and Rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if appointment exists
    const [appointment] = await query('SELECT * FROM Appointment WHERE Appointment_ID = ?', [appointmentId]);
    if (!appointment) {
      return res.status(400).json({ message: 'Appointment not found' });
    }

    // Check if feedback already exists for this appointment and giver
    const [existingFeedback] = await query(
      'SELECT * FROM Feedback WHERE Appointment_ID = ? AND Given_By = ? AND Given_By_ID = ?',
      [appointmentId, givenBy, givenById]
    );

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already exists for this appointment' });
    }

    // Create feedback
    const result = await query(
      'INSERT INTO Feedback (Appointment_ID, Given_By, Given_By_ID, Receiver_ID, Receiver_Type, Comments, Rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [appointmentId, givenBy, givenById, receiverId, receiverType, comments, rating]
    );

    const [newFeedback] = await query(`
      SELECT
        f.*,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      WHERE
        f.Feedback_ID = ?
    `, [result.insertId]);

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Failed to create feedback' });
  }
}

// Update feedback
export async function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { Comments, Rating } = req.body;

    // Check if feedback exists
    const [existingFeedback] = await query('SELECT * FROM Feedback WHERE Feedback_ID = ?', [id]);
    if (!existingFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (Comments !== undefined) {
      updates.push('Comments = ?');
      params.push(Comments);
    }

    if (Rating !== undefined) {
      // Validate rating
      if (Rating < 1 || Rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      updates.push('Rating = ?');
      params.push(Rating);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);

    await query(
      `UPDATE Feedback SET ${updates.join(', ')} WHERE Feedback_ID = ?`,
      params
    );

    const [updatedFeedback] = await query(`
      SELECT
        f.*,
        a.Date as AppointmentDate,
        a.Time as AppointmentTime
      FROM
        Feedback f
      JOIN
        Appointment a ON f.Appointment_ID = a.Appointment_ID
      WHERE
        f.Feedback_ID = ?
    `, [id]);

    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Failed to update feedback' });
  }
}

// Delete feedback
export async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;

    // Check if feedback exists
    const [existingFeedback] = await query('SELECT * FROM Feedback WHERE Feedback_ID = ?', [id]);
    if (!existingFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await query('DELETE FROM Feedback WHERE Feedback_ID = ?', [id]);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Failed to delete feedback' });
  }
}

export default {
  getAllFeedback,
  getFeedbackById,
  getRecentFeedback,
  getFeedbackByPatientId,
  getFeedbackByAppointmentId,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
