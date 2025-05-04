import { query } from '../db.js';

// Get all appointments with patient and doctor details
export async function getAllAppointments(req, res) {
  try {
    const appointments = await query(`
      SELECT
        a.*,
        p.Patient_ID as PatientID,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Doctor_ID as DoctorID,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      ORDER BY
        a.Date DESC, a.Time DESC
    `);

    // Transform the data to match the frontend's expected format
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.Appointment_ID,
      patientId: appointment.Patient_ID,
      doctorId: appointment.Doctor_ID,
      specialization: appointment.Specialization,
      date: appointment.Date,
      time: appointment.Time,
      status: appointment.Status,
      patient: {
        id: appointment.PatientID,
        name: appointment.PatientName,
        bloodGroup: appointment.PatientBloodGroup,
        email: appointment.PatientEmail,
        phone: appointment.PatientPhone
      },
      doctor: {
        id: appointment.DoctorID,
        name: appointment.DoctorName,
        expertise: appointment.DoctorExpertise,
        phone: appointment.DoctorPhone
      }
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ message: 'Failed to get appointments' });
  }
}

// Get appointment by ID
export async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;

    const [appointment] = await query(`
      SELECT
        a.*,
        p.Patient_ID as PatientID,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Doctor_ID as DoctorID,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Appointment_ID = ?
    `, [id]);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Transform the data to match the frontend's expected format
    const transformedAppointment = {
      id: appointment.Appointment_ID,
      patientId: appointment.Patient_ID,
      doctorId: appointment.Doctor_ID,
      specialization: appointment.Specialization,
      date: appointment.Date,
      time: appointment.Time,
      status: appointment.Status,
      patient: {
        id: appointment.PatientID,
        name: appointment.PatientName,
        bloodGroup: appointment.PatientBloodGroup,
        email: appointment.PatientEmail,
        phone: appointment.PatientPhone
      },
      doctor: {
        id: appointment.DoctorID,
        name: appointment.DoctorName,
        expertise: appointment.DoctorExpertise,
        phone: appointment.DoctorPhone
      }
    };

    res.json(transformedAppointment);
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({ message: 'Failed to get appointment' });
  }
}

// Get upcoming appointments
export async function getUpcomingAppointments(req, res) {
  try {
    const limit = req.query.limit || 5;

    const appointments = await query(`
      SELECT
        a.*,
        p.Patient_ID as PatientID,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Doctor_ID as DoctorID,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Date >= CURDATE() AND a.Status = 'Confirmed'
      ORDER BY
        a.Date ASC, a.Time ASC
      LIMIT ?
    `, [parseInt(limit)]);

    // Transform the data to match the frontend's expected format
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.Appointment_ID,
      patientId: appointment.Patient_ID,
      doctorId: appointment.Doctor_ID,
      specialization: appointment.Specialization,
      date: appointment.Date,
      time: appointment.Time,
      status: appointment.Status,
      patient: {
        id: appointment.PatientID,
        name: appointment.PatientName,
        bloodGroup: appointment.PatientBloodGroup,
        email: appointment.PatientEmail,
        phone: appointment.PatientPhone
      },
      doctor: {
        id: appointment.DoctorID,
        name: appointment.DoctorName,
        expertise: appointment.DoctorExpertise,
        phone: appointment.DoctorPhone
      }
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    res.status(500).json({ message: 'Failed to get upcoming appointments' });
  }
}

// Get appointments by patient ID
export async function getAppointmentsByPatientId(req, res) {
  try {
    const { patientId } = req.params;

    const appointments = await query(`
      SELECT
        a.*,
        p.Patient_ID as PatientID,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Doctor_ID as DoctorID,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Patient_ID = ?
      ORDER BY
        a.Date DESC, a.Time DESC
    `, [patientId]);

    // Transform the data to match the frontend's expected format
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.Appointment_ID,
      patientId: appointment.Patient_ID,
      doctorId: appointment.Doctor_ID,
      specialization: appointment.Specialization,
      date: appointment.Date,
      time: appointment.Time,
      status: appointment.Status,
      patient: {
        id: appointment.PatientID,
        name: appointment.PatientName,
        bloodGroup: appointment.PatientBloodGroup,
        email: appointment.PatientEmail,
        phone: appointment.PatientPhone
      },
      doctor: {
        id: appointment.DoctorID,
        name: appointment.DoctorName,
        expertise: appointment.DoctorExpertise,
        phone: appointment.DoctorPhone
      }
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    res.status(500).json({ message: 'Failed to get patient appointments' });
  }
}

// Get appointments by doctor ID
export async function getAppointmentsByDoctorId(req, res) {
  try {
    const { doctorId } = req.params;

    const appointments = await query(`
      SELECT
        a.*,
        p.Patient_ID as PatientID,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Doctor_ID as DoctorID,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Doctor_ID = ?
      ORDER BY
        a.Date DESC, a.Time DESC
    `, [doctorId]);

    // Transform the data to match the frontend's expected format
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.Appointment_ID,
      patientId: appointment.Patient_ID,
      doctorId: appointment.Doctor_ID,
      specialization: appointment.Specialization,
      date: appointment.Date,
      time: appointment.Time,
      status: appointment.Status,
      patient: {
        id: appointment.PatientID,
        name: appointment.PatientName,
        bloodGroup: appointment.PatientBloodGroup,
        email: appointment.PatientEmail,
        phone: appointment.PatientPhone
      },
      doctor: {
        id: appointment.DoctorID,
        name: appointment.DoctorName,
        expertise: appointment.DoctorExpertise,
        phone: appointment.DoctorPhone
      }
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    res.status(500).json({ message: 'Failed to get doctor appointments' });
  }
}

// Create appointment
export async function createAppointment(req, res) {
  try {
    // Handle both camelCase and snake_case field names
    const patientId = req.body.patientId || req.body.Patient_ID;
    const doctorId = req.body.doctorId || req.body.Doctor_ID;
    const specialization = req.body.specialization || req.body.Specialization;
    const date = req.body.date || req.body.Date;
    const time = req.body.time || req.body.Time;
    const status = req.body.status || req.body.Status;

    console.log('Appointment data received:', { patientId, doctorId, specialization, date, time, status });

    // Validate required fields
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'Patient, Doctor, Date and Time are required' });
    }

    // Check if patient exists
    const [patient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [patientId]);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const [doctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [doctorId]);
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found' });
    }

    // Check if doctor is available at the given time (for both Pending and Confirmed appointments)
    const [existingAppointment] = await query(`
      SELECT * FROM Appointment
      WHERE Doctor_ID = ? AND Date = ? AND Time = ? AND Status IN ('Pending', 'Confirmed')
    `, [doctorId, date, time]);

    if (existingAppointment) {
      // Get doctor's name for a more informative message
      const [doctor] = await query('SELECT Name FROM Doctor WHERE Doctor_ID = ?', [doctorId]);
      const doctorName = doctor ? doctor.Name : 'The doctor';

      return res.status(400).json({
        message: `${doctorName} is already booked on ${date} at ${time}. Please select another time slot.`
      });
    }

    // Create appointment
    const result = await query(
      'INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [patientId, doctorId, specialization || doctor.Expertise, date, time, status || 'Pending']
    );

    // If status is Confirmed, create a schedule entry
    if (status === 'Confirmed') {
      await query(
        'INSERT INTO Schedule (Appointment_ID, Patient_ID) VALUES (?, ?)',
        [result.insertId, patientId]
      );
    }

    const [newAppointment] = await query(`
      SELECT
        a.*,
        p.Name as PatientName,
        d.Name as DoctorName
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Appointment_ID = ?
    `, [result.insertId]);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
}

// Update appointment
export async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    console.log('Updating appointment with ID:', id);
    console.log('Request body:', req.body);

    // Check if this is just a status update
    if (Object.keys(req.body).length === 1 && req.body.status) {
      console.log('This is a status-only update');
      return handleStatusUpdate(req, res, id, req.body.status);
    }

    // Handle both camelCase and snake_case field names
    const patientId = req.body.patientId || req.body.Patient_ID;
    const doctorId = req.body.doctorId || req.body.Doctor_ID;
    const specialization = req.body.specialization || req.body.Specialization;
    const date = req.body.date || req.body.Date;
    const time = req.body.time || req.body.Time;
    const status = req.body.status || req.body.Status;

    console.log('Parsed fields:', { patientId, doctorId, specialization, date, time, status });

    // Check if appointment exists
    const [existingAppointment] = await query('SELECT * FROM Appointment WHERE Appointment_ID = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (patientId) {
      // Check if patient exists
      const [patient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [patientId]);
      if (!patient) {
        return res.status(400).json({ message: 'Patient not found' });
      }

      updates.push('Patient_ID = ?');
      params.push(patientId);
    }

    if (doctorId) {
      // Check if doctor exists
      const [doctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [doctorId]);
      if (!doctor) {
        return res.status(400).json({ message: 'Doctor not found' });
      }

      updates.push('Doctor_ID = ?');
      params.push(doctorId);
    }

    if (specialization) {
      updates.push('Specialization = ?');
      params.push(specialization);
    }

    if (date) {
      updates.push('Date = ?');
      params.push(date);
    }

    if (time) {
      updates.push('Time = ?');
      params.push(time);
    }

    if (status) {
      updates.push('Status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Check for double booking if date, time, doctor or status is changing
    if ((date || time || doctorId || (status === 'Confirmed' || status === 'Pending')) && status !== 'Cancelled') {
      const finalDoctorId = doctorId || existingAppointment.Doctor_ID;
      const finalDate = date || existingAppointment.Date;
      const finalTime = time || existingAppointment.Time;

      const [conflictingAppointment] = await query(`
        SELECT * FROM Appointment
        WHERE Doctor_ID = ? AND Date = ? AND Time = ? AND Status IN ('Pending', 'Confirmed') AND Appointment_ID != ?
      `, [finalDoctorId, finalDate, finalTime, id]);

      if (conflictingAppointment) {
        // Get doctor's name for a more informative message
        const [doctor] = await query('SELECT Name FROM Doctor WHERE Doctor_ID = ?', [finalDoctorId]);
        const doctorName = doctor ? doctor.Name : 'The doctor';

        return res.status(400).json({
          message: `${doctorName} is already booked on ${finalDate} at ${finalTime}. Please select another time slot.`
        });
      }
    }

    params.push(id);

    await query(
      `UPDATE Appointment SET ${updates.join(', ')} WHERE Appointment_ID = ?`,
      params
    );

    // Handle schedule updates based on status changes
    if (status === 'Confirmed') {
      // Check if schedule already exists
      const [existingSchedule] = await query(
        'SELECT * FROM Schedule WHERE Appointment_ID = ?',
        [id]
      );

      if (!existingSchedule) {
        // Create new schedule
        const finalPatientId = patientId || existingAppointment.Patient_ID;
        await query(
          'INSERT INTO Schedule (Appointment_ID, Patient_ID) VALUES (?, ?)',
          [id, finalPatientId]
        );
      }
    } else if (status === 'Cancelled' || status === 'Completed') {
      // Remove from schedule if cancelled or completed
      await query('DELETE FROM Schedule WHERE Appointment_ID = ?', [id]);
    }

    const [updatedAppointment] = await query(`
      SELECT
        a.*,
        p.Patient_ID as PatientID,
        p.Name as PatientName,
        p.Blood_Group as PatientBloodGroup,
        p.Email as PatientEmail,
        p.Phone as PatientPhone,
        d.Doctor_ID as DoctorID,
        d.Name as DoctorName,
        d.Expertise as DoctorExpertise,
        d.Phone as DoctorPhone
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Appointment_ID = ?
    `, [id]);

    // Check if updatedAppointment exists
    if (!updatedAppointment) {
      console.error('No updated appointment found after update');
      return res.status(500).json({ message: 'Failed to retrieve updated appointment' });
    }

    console.log('Raw updated appointment:', updatedAppointment);

    try {
      // Transform the data to match the frontend's expected format
      const transformedAppointment = {
        id: updatedAppointment.Appointment_ID,
        patientId: updatedAppointment.Patient_ID,
        doctorId: updatedAppointment.Doctor_ID,
        specialization: updatedAppointment.Specialization,
        date: updatedAppointment.Date,
        time: updatedAppointment.Time,
        status: updatedAppointment.Status,
        patient: {
          id: updatedAppointment.PatientID,
          name: updatedAppointment.PatientName,
          bloodGroup: updatedAppointment.PatientBloodGroup,
          email: updatedAppointment.PatientEmail,
          phone: updatedAppointment.PatientPhone
        },
        doctor: {
          id: updatedAppointment.DoctorID,
          name: updatedAppointment.DoctorName,
          expertise: updatedAppointment.DoctorExpertise,
          phone: updatedAppointment.DoctorPhone
        }
      };
      console.log('Transformed appointment:', transformedAppointment);
      res.json(transformedAppointment);
    } catch (transformError) {
      console.error('Error transforming appointment data:', transformError);
      console.error('Error stack:', transformError.stack);
      throw new Error(`Error transforming appointment data: ${transformError.message}`);
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to update appointment',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Delete appointment
export async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const [existingAppointment] = await query('SELECT * FROM Appointment WHERE Appointment_ID = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment has feedback
    const [feedbackCount] = await query(
      'SELECT COUNT(*) as count FROM Feedback WHERE Appointment_ID = ?',
      [id]
    );

    if (feedbackCount.count > 0) {
      return res.status(400).json({
        message: 'Cannot delete appointment with feedback. Delete feedback first.'
      });
    }

    // Delete related schedule entries
    await query('DELETE FROM Schedule WHERE Appointment_ID = ?', [id]);

    // Delete appointment
    await query('DELETE FROM Appointment WHERE Appointment_ID = ?', [id]);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
}

// Helper function to handle status updates
async function handleStatusUpdate(req, res, id, status) {
  try {
    console.log('Handling status update for appointment:', id, 'New status:', status);

    console.log('Updating appointment status:', id, status);

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Check if appointment exists
    const [existingAppointment] = await query('SELECT * FROM Appointment WHERE Appointment_ID = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update only the status - using a direct approach
    const updateResult = await query('UPDATE Appointment SET Status = ? WHERE Appointment_ID = ?', [status, id]);
    console.log('Update result:', updateResult);

    // Get the updated appointment with minimal information
    const [updatedAppointment] = await query(`
      SELECT
        a.*,
        d.Name as DoctorName,
        p.Name as PatientName
      FROM
        Appointment a
      JOIN
        Patient p ON a.Patient_ID = p.Patient_ID
      JOIN
        Doctor d ON a.Doctor_ID = d.Doctor_ID
      WHERE
        a.Appointment_ID = ?
    `, [id]);

    if (!updatedAppointment) {
      return res.status(500).json({ message: 'Failed to retrieve updated appointment' });
    }

    // Create a simple response object
    const response = {
      id: parseInt(id),
      status: status,
      message: `Appointment status updated to ${status}`,
      appointment: {
        id: parseInt(id),
        patientId: updatedAppointment.Patient_ID,
        doctorId: updatedAppointment.Doctor_ID,
        status: updatedAppointment.Status,
        doctorName: updatedAppointment.DoctorName,
        patientName: updatedAppointment.PatientName
      }
    };

    console.log('Status updated successfully:', response);
    res.json(response);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
}

export default {
  getAllAppointments,
  getAppointmentById,
  getUpcomingAppointments,
  getAppointmentsByPatientId,
  getAppointmentsByDoctorId,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
