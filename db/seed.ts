import { db } from "./index";
import { 
  patients, 
  doctors, 
  appointments, 
  schedules,
  feedback,
  admins 
} from "@shared/schema";
import { format } from "date-fns";
import { sql } from "drizzle-orm";
import * as crypto from "crypto";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Clear tables in reverse dependency order if they exist
    console.log("Clearing existing data...");
    
    // Check if tables exist before attempting to clear them
    const tablesExist = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patients'
      );
    `);
    
    if (tablesExist.rows[0].exists) {
      await db.delete(feedback);
      await db.delete(schedules);
      await db.delete(appointments);
      await db.delete(doctors);
      await db.delete(patients);
      await db.delete(admins);
    } else {
      console.log("Tables don't exist yet, skipping clear operation");
    }

    // Insert sample data
    console.log("Inserting seed data...");

    // Seed patients
    const insertedPatients = await db.insert(patients).values([
      {
        name: "Rahul Sharma",
        bloodGroup: "O+",
        dob: new Date("1995-07-12"),
        address: "Mumbai, India",
        phone: "9876543210",
        email: "rahul.sharma@example.com"
      },
      {
        name: "Ayesha Khan",
        bloodGroup: "A-",
        dob: new Date("1992-04-25"),
        address: "Delhi, India",
        phone: "8765432109",
        email: "ayesha.khan@example.com"
      },
      {
        name: "Vikram Singh",
        bloodGroup: "B+",
        dob: new Date("1988-10-08"),
        address: "Bangalore, India",
        phone: "7654321098",
        email: "vikram.singh@example.com"
      },
      {
        name: "Meera Iyer",
        bloodGroup: "AB+",
        dob: new Date("1996-01-15"),
        address: "Chennai, India",
        phone: "6543210987",
        email: "meera.iyer@example.com"
      },
      {
        name: "Sandeep Verma",
        bloodGroup: "A+",
        dob: new Date("1985-06-30"),
        address: "Pune, India",
        phone: "5432109876",
        email: "sandeep.verma@example.com"
      }
    ]).returning();

    // Seed doctors
    const insertedDoctors = await db.insert(doctors).values([
      {
        name: "Dr. Arjun Kapoor",
        phone: "9123456789",
        address: "Delhi, India",
        expertise: "Cardiology",
        experience: 15,
        gender: "Male"
      },
      {
        name: "Dr. Neha Malhotra",
        phone: "9234567890",
        address: "Mumbai, India",
        expertise: "Dermatology",
        experience: 10,
        gender: "Female"
      },
      {
        name: "Dr. Ravi Gupta",
        phone: "9345678901",
        address: "Bangalore, India",
        expertise: "Orthopedics",
        experience: 12,
        gender: "Male"
      },
      {
        name: "Dr. Sunita Desai",
        phone: "9456789012",
        address: "Chennai, India",
        expertise: "Pediatrics",
        experience: 8,
        gender: "Female"
      },
      {
        name: "Dr. Anil Joshi",
        phone: "9567890123",
        address: "Pune, India",
        expertise: "General Medicine",
        experience: 20,
        gender: "Male"
      }
    ]).returning();

    // Create future dates for appointments
    const futureDate1 = new Date();
    futureDate1.setFullYear(futureDate1.getFullYear() + 1);
    futureDate1.setDate(10);
    futureDate1.setMonth(2); // March
    
    const futureDate2 = new Date();
    futureDate2.setFullYear(futureDate2.getFullYear() + 1);
    futureDate2.setDate(11);
    futureDate2.setMonth(2); // March
    
    const futureDate3 = new Date();
    futureDate3.setFullYear(futureDate3.getFullYear() + 1);
    futureDate3.setDate(12);
    futureDate3.setMonth(2); // March
    
    const futureDate4 = new Date();
    futureDate4.setFullYear(futureDate4.getFullYear() + 1);
    futureDate4.setDate(13);
    futureDate4.setMonth(2); // March
    
    const futureDate5 = new Date();
    futureDate5.setFullYear(futureDate5.getFullYear() + 1);
    futureDate5.setDate(14);
    futureDate5.setMonth(2); // March
    
    const futureDate6 = new Date();
    futureDate6.setFullYear(futureDate6.getFullYear() + 1);
    futureDate6.setDate(15);
    futureDate6.setMonth(2); // March
    
    const futureDate7 = new Date();
    futureDate7.setFullYear(futureDate7.getFullYear() + 1);
    futureDate7.setDate(16);
    futureDate7.setMonth(2); // March
    
    const futureDate8 = new Date();
    futureDate8.setFullYear(futureDate8.getFullYear() + 1);
    futureDate8.setDate(17);
    futureDate8.setMonth(2); // March
    
    const futureDate9 = new Date();
    futureDate9.setFullYear(futureDate9.getFullYear() + 1);
    futureDate9.setDate(18);
    futureDate9.setMonth(2); // March
    
    const futureDate10 = new Date();
    futureDate10.setFullYear(futureDate10.getFullYear() + 1);
    futureDate10.setDate(19);
    futureDate10.setMonth(2); // March

    // Seed appointments
    const insertedAppointments = await db.insert(appointments).values([
      {
        patientId: insertedPatients[0].id,
        doctorId: insertedDoctors[0].id,
        specialization: "Cardiology",
        date: format(futureDate1, 'yyyy-MM-dd'),
        time: "10:30:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[1].id,
        doctorId: insertedDoctors[1].id,
        specialization: "Dermatology",
        date: format(futureDate2, 'yyyy-MM-dd'),
        time: "14:00:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[2].id,
        doctorId: insertedDoctors[2].id,
        specialization: "Orthopedics",
        date: format(futureDate3, 'yyyy-MM-dd'),
        time: "09:00:00",
        status: "Cancelled"
      },
      {
        patientId: insertedPatients[3].id,
        doctorId: insertedDoctors[3].id,
        specialization: "Pediatrics",
        date: format(futureDate4, 'yyyy-MM-dd'),
        time: "11:15:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[4].id,
        doctorId: insertedDoctors[4].id,
        specialization: "General Medicine",
        date: format(futureDate5, 'yyyy-MM-dd'),
        time: "16:30:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[0].id,
        doctorId: insertedDoctors[2].id,
        specialization: "Orthopedics",
        date: format(futureDate6, 'yyyy-MM-dd'),
        time: "10:45:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[1].id,
        doctorId: insertedDoctors[3].id,
        specialization: "Pediatrics",
        date: format(futureDate7, 'yyyy-MM-dd'),
        time: "13:30:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[2].id,
        doctorId: insertedDoctors[4].id,
        specialization: "General Medicine",
        date: format(futureDate8, 'yyyy-MM-dd'),
        time: "15:00:00",
        status: "Cancelled"
      },
      {
        patientId: insertedPatients[3].id,
        doctorId: insertedDoctors[0].id,
        specialization: "Cardiology",
        date: format(futureDate9, 'yyyy-MM-dd'),
        time: "12:00:00",
        status: "Confirmed"
      },
      {
        patientId: insertedPatients[4].id,
        doctorId: insertedDoctors[1].id,
        specialization: "Dermatology",
        date: format(futureDate10, 'yyyy-MM-dd'),
        time: "14:45:00",
        status: "Confirmed"
      }
    ]).returning();

    // Seed schedules for confirmed appointments
    const schedulesToInsert = insertedAppointments
      .filter(appointment => appointment.status === "Confirmed")
      .map(appointment => ({
        appointmentId: appointment.id,
        patientId: appointment.patientId
      }));

    await db.insert(schedules).values(schedulesToInsert);

    // Seed feedback
    await db.insert(feedback).values([
      {
        appointmentId: insertedAppointments[0].id,
        givenBy: "Patient",
        givenById: insertedPatients[0].id,
        receiverId: insertedDoctors[0].id,
        receiverType: "Doctor",
        comments: "Very knowledgeable and helpful doctor!",
        rating: 5,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[1].id,
        givenBy: "Patient",
        givenById: insertedPatients[1].id,
        receiverId: insertedDoctors[1].id,
        receiverType: "Doctor",
        comments: "Great experience, highly recommended.",
        rating: 4,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[3].id,
        givenBy: "Patient",
        givenById: insertedPatients[3].id,
        receiverId: insertedDoctors[3].id,
        receiverType: "Doctor",
        comments: "Very friendly and patient with my child.",
        rating: 5,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[4].id,
        givenBy: "Patient",
        givenById: insertedPatients[4].id,
        receiverId: insertedDoctors[4].id,
        receiverType: "Doctor",
        comments: "Professional and efficient service.",
        rating: 4,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[5].id,
        givenBy: "Patient",
        givenById: insertedPatients[0].id,
        receiverId: insertedDoctors[2].id,
        receiverType: "Doctor",
        comments: "Doctor was a bit late but treatment was good.",
        rating: 3,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[6].id,
        givenBy: "Patient",
        givenById: insertedPatients[1].id,
        receiverId: insertedDoctors[3].id,
        receiverType: "Doctor",
        comments: "Explained everything clearly, very satisfied.",
        rating: 5,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[8].id,
        givenBy: "Patient",
        givenById: insertedPatients[3].id,
        receiverId: insertedDoctors[0].id,
        receiverType: "Doctor",
        comments: "Excellent diagnosis and treatment.",
        rating: 5,
        date: new Date()
      },
      {
        appointmentId: insertedAppointments[9].id,
        givenBy: "Patient",
        givenById: insertedPatients[4].id,
        receiverId: insertedDoctors[1].id,
        receiverType: "Doctor",
        comments: "Good experience overall.",
        rating: 4,
        date: new Date()
      }
    ]);

    // Create a hash of the password
    const hashedPassword = crypto
      .createHash('sha256')
      .update('RUDRAKSH2005.')
      .digest('hex');

    // Seed admin
    await db.insert(admins).values({
      username: "rudraksh_admin",
      password: hashedPassword
    });

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seed operation:", error);
  }
}

seed();
