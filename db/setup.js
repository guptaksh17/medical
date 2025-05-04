import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MySQL connection details
const host = 'localhost';
const user = 'rudraksh_admin';
const password = 'Kshsrm@1';
const database = 'APPOINTMENT_BOOKING';

// Path to SQL file
const sqlFilePath = join(__dirname, 'setup.sql');

// Read SQL file
const sqlScript = readFileSync(sqlFilePath, 'utf8');

// Command to execute SQL script
const command = `mysql -h ${host} -u ${user} -p${password} < "${sqlFilePath}"`;

console.log('Setting up database...');

// Execute command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    console.error('You might need to create the MySQL user first:');
    console.error(`CREATE USER '${user}'@'${host}' IDENTIFIED BY '${password}';`);
    console.error(`GRANT ALL PRIVILEGES ON *.* TO '${user}'@'${host}';`);
    console.error('FLUSH PRIVILEGES;');
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log('Database setup completed successfully!');
});
