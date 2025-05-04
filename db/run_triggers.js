import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'rudraksh_admin';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Kshsrm@1';
const DB_NAME = process.env.DB_NAME || 'APPOINTMENT_BOOKING';

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'simple_triggers.sql');

// Command to run the SQL file
const command = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < ${sqlFilePath}`;

console.log('Applying triggers from SQL file...');

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log('Triggers applied successfully');

  // Verify the triggers were created
  const verifyCommand = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "SHOW TRIGGERS"`;

  exec(verifyCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error verifying triggers: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log('Triggers in the database:');
    console.log(stdout);
  });
});
