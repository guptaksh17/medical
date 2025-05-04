import mysql from 'mysql2/promise';

// MySQL connection details
const host = 'localhost';
const user = 'rudraksh_admin';
const password = 'Kshsrm@1';
const database = 'APPOINTMENT_BOOKING';

async function testConnection() {
  let connection;
  
  try {
    console.log('Testing connection to MySQL...');
    
    // Connect to MySQL
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });
    
    console.log('Connected to MySQL database successfully!');
    
    // Test query
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables in the database:');
    rows.forEach(row => {
      console.log(`- ${Object.values(row)[0]}`);
    });
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your MySQL credentials.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure MySQL server is running.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database '${database}' does not exist. Please run the setup script first.`);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed.');
    }
  }
}

testConnection();
