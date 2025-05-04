import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// Default to localhost if no DATABASE_URL is provided
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://rudraksh_admin:Kshsrm@1@localhost:3306/APPOINTMENT_BOOKING';

// Create MySQL connection pool
const poolConnection = mysql.createPool(DATABASE_URL);

// Create Drizzle ORM instance
export const db = drizzle(poolConnection, { schema });