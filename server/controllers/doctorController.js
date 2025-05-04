import { query } from '../db.js';

// Helper function to map database fields to frontend expected format
function mapDoctorFields(doctor) {
  return {
    id: doctor.Doctor_ID,
    name: doctor.Name,
    phone: doctor.Phone,
    address: doctor.Address,
    expertise: doctor.Expertise,
    experience: doctor.Experience,
    gender: doctor.Gender,
    // Keep original fields for backward compatibility
    Doctor_ID: doctor.Doctor_ID,
    Name: doctor.Name,
    Phone: doctor.Phone,
    Address: doctor.Address,
    Expertise: doctor.Expertise,
    Experience: doctor.Experience,
    Gender: doctor.Gender
  };
}

// Get all doctors with optional search parameters
export async function getAllDoctors(req, res) {
  try {
    const { searchTerm, expertise } = req.query;

    let sql = 'SELECT * FROM Doctor WHERE 1=1';
    const params = [];

    // Add search conditions if parameters are provided
    if (searchTerm) {
      sql += ' AND (Name LIKE ? OR Phone LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern);
    }

    if (expertise && expertise !== 'all') {
      sql += ' AND Expertise = ?';
      params.push(expertise);
    }

    sql += ' ORDER BY Doctor_ID DESC';

    const doctors = await query(sql, params);

    // Map the fields to the expected format
    const mappedDoctors = doctors.map(mapDoctorFields);
    res.json(mappedDoctors);
  } catch (error) {
    console.error('Error getting doctors:', error);
    res.status(500).json({ message: 'Failed to get doctors' });
  }
}

// Get doctor by ID
export async function getDoctorById(req, res) {
  try {
    const { id } = req.params;
    const [doctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [id]);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Map the fields to the expected format
    const mappedDoctor = mapDoctorFields(doctor);
    res.json(mappedDoctor);
  } catch (error) {
    console.error('Error getting doctor:', error);
    res.status(500).json({ message: 'Failed to get doctor' });
  }
}

// Search doctors
export async function searchDoctors(req, res) {
  try {
    const { searchTerm, expertise } = req.query;

    let sql = 'SELECT * FROM Doctor WHERE 1=1';
    const params = [];

    if (searchTerm) {
      sql += ' AND (Name LIKE ? OR Phone LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern);
    }

    if (expertise) {
      sql += ' AND Expertise = ?';
      params.push(expertise);
    }

    sql += ' ORDER BY Doctor_ID DESC';

    const doctors = await query(sql, params);
    // Map the fields to the expected format
    const mappedDoctors = doctors.map(mapDoctorFields);
    res.json(mappedDoctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Failed to search doctors' });
  }
}

// Get top-rated doctors
export async function getTopRatedDoctors(req, res) {
  try {
    const limit = req.query.limit || 5;

    // Get doctors with their average ratings
    const doctors = await query(`
      SELECT
        d.*,
        AVG(f.Rating) as AverageRating,
        COUNT(f.Feedback_ID) as ReviewCount
      FROM
        Doctor d
      LEFT JOIN
        Feedback f ON f.Receiver_ID = d.Doctor_ID AND f.Receiver_Type = 'Doctor'
      GROUP BY
        d.Doctor_ID
      ORDER BY
        AverageRating DESC, ReviewCount DESC
      LIMIT ?
    `, [parseInt(limit)]);

    // Map the fields to the expected format and add avgRating field
    const mappedDoctors = doctors.map(doctor => {
      const mappedDoctor = mapDoctorFields(doctor);
      return {
        ...mappedDoctor,
        avgRating: doctor.AverageRating || 0,
        reviewCount: doctor.ReviewCount || 0,
        // Keep original fields for backward compatibility
        AverageRating: doctor.AverageRating,
        ReviewCount: doctor.ReviewCount
      };
    });

    res.json(mappedDoctors);
  } catch (error) {
    console.error('Error getting top-rated doctors:', error);
    res.status(500).json({ message: 'Failed to get top-rated doctors' });
  }
}

// Create doctor
export async function createDoctor(req, res) {
  try {
    // Handle both camelCase and snake_case field names
    const name = req.body.name || req.body.Name;
    const phone = req.body.phone || req.body.Phone;
    const address = req.body.address || req.body.Address;
    const expertise = req.body.expertise || req.body.Expertise;
    const experience = req.body.experience || req.body.Experience;
    const gender = req.body.gender || req.body.Gender;

    // Validate phone number
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }

    const result = await query(
      'INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone, address, expertise, experience, gender]
    );

    const [newDoctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [result.insertId]);
    // Map the fields to the expected format
    const mappedDoctor = mapDoctorFields(newDoctor);
    res.status(201).json(mappedDoctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Failed to create doctor' });
  }
}

// Update doctor
export async function updateDoctor(req, res) {
  try {
    const { id } = req.params;

    // Handle both camelCase and snake_case field names
    const name = req.body.name || req.body.Name;
    const phone = req.body.phone || req.body.Phone;
    const address = req.body.address || req.body.Address;
    const expertise = req.body.expertise || req.body.Expertise;
    const experience = req.body.experience !== undefined ? req.body.experience : req.body.Experience;
    const gender = req.body.gender || req.body.Gender;

    // Validate phone number
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }

    // Check if doctor exists
    const [existingDoctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [id]);
    if (!existingDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name) {
      updates.push('Name = ?');
      params.push(name);
    }

    if (phone) {
      updates.push('Phone = ?');
      params.push(phone);
    }

    if (address !== undefined) {
      updates.push('Address = ?');
      params.push(address);
    }

    if (expertise) {
      updates.push('Expertise = ?');
      params.push(expertise);
    }

    if (experience !== undefined) {
      updates.push('Experience = ?');
      params.push(experience);
    }

    if (gender !== undefined) {
      updates.push('Gender = ?');
      params.push(gender);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);

    await query(
      `UPDATE Doctor SET ${updates.join(', ')} WHERE Doctor_ID = ?`,
      params
    );

    const [updatedDoctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [id]);
    // Map the fields to the expected format
    const mappedDoctor = mapDoctorFields(updatedDoctor);
    res.json(mappedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Failed to update doctor' });
  }
}

// Delete doctor
export async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;

    // Check if doctor exists
    const [existingDoctor] = await query('SELECT * FROM Doctor WHERE Doctor_ID = ?', [id]);
    if (!existingDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor has appointments
    const [appointmentCount] = await query(
      'SELECT COUNT(*) as count FROM Appointment WHERE Doctor_ID = ?',
      [id]
    );

    if (appointmentCount.count > 0) {
      return res.status(400).json({
        message: 'Cannot delete doctor with existing appointments. Delete appointments first.'
      });
    }

    await query('DELETE FROM Doctor WHERE Doctor_ID = ?', [id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
}

export default {
  getAllDoctors,
  getDoctorById,
  searchDoctors,
  getTopRatedDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
