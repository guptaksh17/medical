import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyTriggers() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'rudraksh_admin',
      password: process.env.DB_PASSWORD || 'Kshsrm@1',
      database: process.env.DB_NAME || 'APPOINTMENT_BOOKING',
      multipleStatements: true // Important for running multiple SQL statements
    });

    console.log('Connected to the database');

    // Read the SQL file with the triggers
    const triggerFilePath = path.join(__dirname, 'doctor_availability_trigger.sql');
    const triggerSQL = fs.readFileSync(triggerFilePath, 'utf8');

    // Split the SQL by DELIMITER to handle the trigger definitions correctly
    const statements = triggerSQL.split('DELIMITER //');
    
    for (let i = 1; i < statements.length; i++) {
      const triggerBody = statements[i].split('DELIMITER ;')[0];
      
      // Execute each trigger definition
      console.log(`Executing trigger definition ${i}...`);
      await connection.query(triggerBody);
      console.log(`Trigger definition ${i} applied successfully`);
    }

    console.log('All triggers have been applied successfully');
    
    // Close the connection
    await connection.end();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error applying triggers:', error);
    process.exit(1);
  }
}

// Run the function
applyTriggers();
