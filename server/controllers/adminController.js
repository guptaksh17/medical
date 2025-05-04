import { query } from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../auth.js';

// Login
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Get admin by username
    const [admin] = await query('SELECT * FROM Admin WHERE Username = ?', [username]);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Special case for the default admin user with SHA2 hashed password
    if (username === 'rudraksh_admin') {
      // Create SHA2 hash of the provided password to compare with stored hash
      const [result] = await query(
        'SELECT SHA2(?, 256) as hashedPassword',
        [password]
      );

      const sha2HashedPassword = result.hashedPassword;

      // Compare the SHA2 hashed password with the stored password
      if (sha2HashedPassword === admin.Password) {
        // Generate token
        const token = generateToken(admin);

        return res.json({
          token,
          user: {
            id: admin.Admin_ID,
            username: admin.Username
          }
        });
      }
    } else {
      // For other users, use bcrypt comparison
      const isPasswordValid = await comparePassword(password, admin.Password);

      if (isPasswordValid) {
        // Generate token
        const token = generateToken(admin);

        return res.json({
          token,
          user: {
            id: admin.Admin_ID,
            username: admin.Username
          }
        });
      }
    }

    // If we get here, authentication failed
    return res.status(401).json({ message: 'Invalid username or password' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

// Register
export async function register(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already exists
    const [existingAdmin] = await query('SELECT * FROM Admin WHERE Username = ?', [username]);

    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const result = await query(
      'INSERT INTO Admin (Username, Password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: result.insertId,
        username
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
}

// Get dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    // Get total patients
    const [patientCount] = await query('SELECT COUNT(*) as count FROM Patient');

    // Get total doctors
    const [doctorCount] = await query('SELECT COUNT(*) as count FROM Doctor');

    // Get today's appointments
    const [todayAppointments] = await query(`
      SELECT COUNT(*) as count FROM Appointment
      WHERE Date = CURDATE()
    `);

    // Get upcoming appointments
    const [upcomingAppointments] = await query(`
      SELECT COUNT(*) as count FROM Appointment
      WHERE Date >= CURDATE() AND Status = 'Confirmed'
    `);

    // Get average rating
    const [averageRating] = await query(`
      SELECT AVG(Rating) as avg FROM Feedback
    `);

    res.json({
      totalPatients: patientCount.count,
      totalDoctors: doctorCount.count,
      todayAppointments: todayAppointments.count,
      upcomingAppointments: upcomingAppointments.count,
      averageRating: averageRating.avg ? parseFloat(averageRating.avg.toFixed(1)) : 0
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
}

export default {
  login,
  register,
  getDashboardStats
};
