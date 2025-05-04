import { Request, Response } from 'express';
import { storage } from '../storage';

// Get dashboard statistics
export async function getDashboardStats(req: Request, res: Response) {
  try {
    console.log('Fetching dashboard stats from TypeScript controller...');

    // Get total patients with error handling
    let patientCount;
    try {
      const patients = await storage.getAllPatients();
      patientCount = patients.length;
      console.log('Patient count:', patientCount);
    } catch (error) {
      console.error('Error getting patient count:', error);
      patientCount = 0;
    }

    // Get total doctors with error handling
    let doctorCount;
    try {
      const doctors = await storage.getAllDoctors();
      doctorCount = doctors.length;
      console.log('Doctor count:', doctorCount);
    } catch (error) {
      console.error('Error getting doctor count:', error);
      doctorCount = 0;
    }

    // Get today's appointments with error handling
    let todayAppointments;
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      const appointments = await storage.getAllAppointments();
      todayAppointments = appointments.filter(app =>
        app.date && app.date.toString() === formattedDate
      ).length;

      console.log('Today appointments:', todayAppointments);
    } catch (error) {
      console.error('Error getting today appointments:', error);
      todayAppointments = 0;
    }

    // Get upcoming appointments with error handling
    let upcomingAppointments;
    try {
      const appointments = await storage.getUpcomingAppointments();
      upcomingAppointments = appointments.length;
      console.log('Upcoming appointments:', upcomingAppointments);
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      upcomingAppointments = 0;
    }

    // Get average rating with error handling
    let averageRating = 0;
    try {
      const allFeedback = await storage.getAllFeedback();
      if (allFeedback.length > 0) {
        const totalRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0);
        averageRating = totalRating / allFeedback.length;
      }
      console.log('Average rating:', averageRating);
    } catch (error) {
      console.error('Error getting average rating:', error);
      averageRating = 0;
    }

    const stats = {
      totalPatients: patientCount || 0,
      totalDoctors: doctorCount || 0,
      todayAppointments: todayAppointments || 0,
      upcomingAppointments: upcomingAppointments || 0,
      averageRating: averageRating ? parseFloat(averageRating.toFixed(1)) : 0
    };

    console.log('Sending dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
}

export default {
  getDashboardStats
};
