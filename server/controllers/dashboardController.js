import { query } from '../db.js';

// Get dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    console.log('Fetching dashboard stats...');

    // Get all stats in a simplified way with better error handling
    try {
      // Get total patients
      const patientResult = await query('SELECT COUNT(*) as count FROM Patient');
      const patientCount = patientResult[0]?.count || 0;
      console.log('Patient count:', patientCount);

      // Get total doctors
      const doctorResult = await query('SELECT COUNT(*) as count FROM Doctor');
      const doctorCount = doctorResult[0]?.count || 0;
      console.log('Doctor count:', doctorCount);

      // Get today's appointments
      const todayResult = await query(`
        SELECT COUNT(*) as count FROM Appointment
        WHERE Date = CURDATE()
      `);
      const todayAppointments = todayResult[0]?.count || 0;
      console.log('Today appointments:', todayAppointments);

      // Get upcoming appointments
      const upcomingResult = await query(`
        SELECT COUNT(*) as count FROM Appointment
        WHERE Date >= CURDATE() AND Status = 'Confirmed'
      `);
      const upcomingAppointments = upcomingResult[0]?.count || 0;
      console.log('Upcoming appointments:', upcomingAppointments);

      // Get average rating
      const ratingResult = await query(`
        SELECT AVG(Rating) as avg FROM Feedback
      `);
      const avgRating = ratingResult[0]?.avg || 0;
      const averageRating = avgRating ? parseFloat(avgRating.toFixed(1)) : 0;
      console.log('Average rating:', averageRating);

      const stats = {
        totalPatients: patientCount,
        totalDoctors: doctorCount,
        todayAppointments: todayAppointments,
        upcomingAppointments: upcomingAppointments,
        averageRating: averageRating
      };

      console.log('Sending dashboard stats:', stats);
      res.json(stats);
    } catch (error) {
      console.error('Error in database queries:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
}

export default {
  getDashboardStats
};
