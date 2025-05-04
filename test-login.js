import mysql from 'mysql2/promise';

async function testLogin() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'rudraksh_admin',
      password: 'Kshsrm@1',
      database: 'APPOINTMENT_BOOKING'
    });

    // Get admin user
    const [admins] = await connection.execute('SELECT * FROM Admin WHERE Username = ?', ['rudraksh_admin']);
    
    if (admins.length === 0) {
      console.log('Admin user not found. Creating default admin...');
      
      // Create admin user
      await connection.execute(
        'INSERT INTO Admin (Username, Password) VALUES (?, SHA2(?, 256))',
        ['rudraksh_admin', 'RUDRAKSH2005.']
      );
      
      console.log('Default admin created successfully.');
    } else {
      console.log('Admin user found:', admins[0].Username);
      
      // Test password
      const [result] = await connection.execute(
        'SELECT SHA2(?, 256) as hashedPassword',
        ['RUDRAKSH2005.']
      );
      
      const sha2HashedPassword = result[0].hashedPassword;
      
      console.log('Stored password:', admins[0].Password);
      console.log('Computed hash:', sha2HashedPassword);
      
      if (sha2HashedPassword === admins[0].Password) {
        console.log('Password matches!');
      } else {
        console.log('Password does not match. Updating password...');
        
        // Update admin password
        await connection.execute(
          'UPDATE Admin SET Password = SHA2(?, 256) WHERE Username = ?',
          ['RUDRAKSH2005.', 'rudraksh_admin']
        );
        
        console.log('Password updated successfully.');
      }
    }
    
    // Close connection
    await connection.end();
    
    console.log('Test completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
