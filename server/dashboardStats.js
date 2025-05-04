import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a direct connection pool for this specific endpoint
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'rudraksh_admin',
  password: process.env.DB_PASSWORD || 'Kshsrm@1',
  database: process.env.DB_NAME || 'APPOINTMENT_BOOKING',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

// Simple query function
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}

// Get dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    console.log('Fetching dashboard stats from dedicated endpoint...');
    
    // Use Promise.all to run all queries in parallel
    const [
      patientResult,
      doctorResult,
      todayResult,
      upcomingResult,
      ratingResult
    ] = await Promise.all([
      // Get total patients
      executeQuery('SELECT COUNT(*) as count FROM Patient'),
      // Get total doctors
      executeQuery('SELECT COUNT(*) as count FROM Doctor'),
      // Get today's appointments
      executeQuery('SELECT COUNT(*) as count FROM Appointment WHERE Date = CURDATE()'),
      // Get upcoming appointments
      executeQuery('SELECT COUNT(*) as count FROM Appointment WHERE Date >= CURDATE() AND Status = ?', ['Confirmed']),
      // Get average rating
      executeQuery('SELECT AVG(Rating) as avg FROM Feedback')
    ]);
    
    // Extract values with fallbacks
    const totalPatients = patientResult[0]?.count || 0;
    const totalDoctors = doctorResult[0]?.count || 0;
    const todayAppointments = todayResult[0]?.count || 0;
    const upcomingAppointments = upcomingResult[0]?.count || 0;
    const avgRating = ratingResult[0]?.avg || 0;
    const averageRating = avgRating ? parseFloat(avgRating.toFixed(1)) : 0;
    
    // Create stats object
    const stats = {
      totalPatients,
      totalDoctors,
      todayAppointments,
      upcomingAppointments,
      averageRating
    };
    
    console.log('Dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Send a more detailed error response
    res.status(500).json({ 
      message: 'Failed to get dashboard stats',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default {
  getDashboardStats
};
