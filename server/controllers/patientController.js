import { query } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get all patients with optional search parameters
export async function getAllPatients(req, res) {
  try {
    console.log('Getting all patients with query:', req.query);
    const { searchTerm, bloodGroup } = req.query;

    let sql = 'SELECT * FROM Patient WHERE 1=1';
    const params = [];

    // Add search conditions if parameters are provided
    if (searchTerm) {
      sql += ' AND (Name LIKE ? OR Email LIKE ? OR Phone LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (bloodGroup && bloodGroup !== 'all') {
      sql += ' AND Blood_Group = ?';
      params.push(bloodGroup);
    }

    sql += ' ORDER BY Patient_ID DESC';
    console.log('SQL query:', sql, 'with params:', params);

    const patients = await query(sql, params);
    console.log('Patients found:', patients.length);

    // Map the database fields to camelCase for frontend consistency
    const mappedPatients = patients.map(patient => ({
      id: patient.Patient_ID,
      name: patient.Name,
      bloodGroup: patient.Blood_Group,
      dob: patient.DOB,
      address: patient.Address,
      phone: patient.Phone,
      email: patient.Email
    }));

    console.log('Mapped patients:', mappedPatients.length);
    res.json(mappedPatients);
  } catch (error) {
    console.error('Error getting patients:', error);
    res.status(500).json({ message: 'Failed to get patients' });
  }
}

// Get patient by ID
export async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    console.log('Getting patient by ID:', id);

    const [patient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [id]);

    if (!patient) {
      console.log('Patient not found with ID:', id);
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Map the database fields to camelCase for frontend consistency
    const mappedPatient = {
      id: patient.Patient_ID,
      name: patient.Name,
      bloodGroup: patient.Blood_Group,
      dob: patient.DOB,
      address: patient.Address,
      phone: patient.Phone,
      email: patient.Email
    };

    console.log('Found patient:', mappedPatient);
    res.json(mappedPatient);
  } catch (error) {
    console.error('Error getting patient:', error);
    res.status(500).json({ message: 'Failed to get patient' });
  }
}

// Search patients
export async function searchPatients(req, res) {
  try {
    console.log('Searching patients with query:', req.query);
    const { searchTerm, bloodGroup } = req.query;
    console.log('Search term:', searchTerm, 'Blood group:', bloodGroup);

    let sql = 'SELECT * FROM Patient WHERE 1=1';
    const params = [];

    if (searchTerm) {
      sql += ' AND (Name LIKE ? OR Email LIKE ? OR Phone LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (bloodGroup) {
      sql += ' AND Blood_Group = ?';
      params.push(bloodGroup);
    }

    sql += ' ORDER BY Patient_ID DESC';
    console.log('SQL query:', sql, 'with params:', params);

    const patients = await query(sql, params);
    console.log('Patients found in search:', patients.length);

    // Map the database fields to camelCase for frontend consistency
    const mappedPatients = patients.map(patient => ({
      id: patient.Patient_ID,
      name: patient.Name,
      bloodGroup: patient.Blood_Group,
      dob: patient.DOB,
      address: patient.Address,
      phone: patient.Phone,
      email: patient.Email
    }));

    res.json(mappedPatients);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ message: 'Failed to search patients' });
  }
}

// Create patient
export async function createPatient(req, res) {
  try {
    const { Name, Blood_Group, DOB, Address, Phone, Email } = req.body;

    // Validate phone number
    if (Phone && !/^[0-9]{10}$/.test(Phone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }

    // Check if email already exists
    const [existingPatient] = await query('SELECT * FROM Patient WHERE Email = ?', [Email]);
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const result = await query(
      'INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email) VALUES (?, ?, ?, ?, ?, ?)',
      [Name, Blood_Group, DOB, Address, Phone, Email]
    );

    const [newPatient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [result.insertId]);
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Failed to create patient' });
  }
}

// Update patient
export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const { Name, Blood_Group, DOB, Address, Phone, Email } = req.body;

    // Validate phone number
    if (Phone && !/^[0-9]{10}$/.test(Phone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }

    // Check if patient exists
    const [existingPatient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [id]);
    if (!existingPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if email already exists (for another patient)
    if (Email) {
      const [emailExists] = await query(
        'SELECT * FROM Patient WHERE Email = ? AND Patient_ID != ?',
        [Email, id]
      );
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (Name) {
      updates.push('Name = ?');
      params.push(Name);
    }

    if (Blood_Group) {
      updates.push('Blood_Group = ?');
      params.push(Blood_Group);
    }

    if (DOB) {
      updates.push('DOB = ?');
      params.push(DOB);
    }

    if (Address) {
      updates.push('Address = ?');
      params.push(Address);
    }

    if (Phone) {
      updates.push('Phone = ?');
      params.push(Phone);
    }

    if (Email) {
      updates.push('Email = ?');
      params.push(Email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(id);

    await query(
      `UPDATE Patient SET ${updates.join(', ')} WHERE Patient_ID = ?`,
      params
    );

    const [updatedPatient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [id]);
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Failed to update patient' });
  }
}

// Delete patient
export async function deletePatient(req, res) {
  try {
    const { id } = req.params;

    // Check if patient exists
    const [existingPatient] = await query('SELECT * FROM Patient WHERE Patient_ID = ?', [id]);
    if (!existingPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if patient has appointments
    const [appointmentCount] = await query(
      'SELECT COUNT(*) as count FROM Appointment WHERE Patient_ID = ?',
      [id]
    );

    if (appointmentCount.count > 0) {
      return res.status(400).json({
        message: 'Cannot delete patient with existing appointments. Delete appointments first.'
      });
    }

    await query('DELETE FROM Patient WHERE Patient_ID = ?', [id]);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Failed to delete patient' });
  }
}

// Patient login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find patient by email
    const [patient] = await query('SELECT * FROM Patient WHERE Email = ?', [email]);

    if (!patient) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, patient.Password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: patient.Patient_ID, email: patient.Email, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: patient.Patient_ID,
        name: patient.Name,
        email: patient.Email,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error('Error during patient login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

// Patient registration
export async function register(req, res) {
  try {
    const { name, email, phone, dob, bloodGroup, address, password } = req.body;

    // Validate phone number
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number' });
    }

    // Check if email already exists
    const [existingPatient] = await query('SELECT * FROM Patient WHERE Email = ?', [email]);
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new patient
    const result = await query(
      'INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email, Password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, bloodGroup, dob, address, phone, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      patient: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}

export default {
  getAllPatients,
  getPatientById,
  searchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  login,
  register
};
