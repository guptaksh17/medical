import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MySQL connection details
const host = 'localhost';
const user = 'root'; // Use root initially to create the database and user
const password = ''; // Your MySQL root password

// Path to SQL file
const sqlFilePath = join(__dirname, 'setup.sql');

// Read SQL file
const sqlScript = readFileSync(sqlFilePath, 'utf8');

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    
    // Connect to MySQL
    connection = await mysql.createConnection({
      host,
      user,
      password,
      multipleStatements: true
    });
    
    console.log('Connected to MySQL. Setting up database...');
    
    // Execute SQL script
    await connection.query(sqlScript);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your MySQL credentials.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure MySQL server is running.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed.');
    }
  }
}

setupDatabase();
