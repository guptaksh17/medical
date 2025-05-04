import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'appointment_scheduler_secret_key';

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { id: user.Admin_ID, username: user.Username },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const user = verifyToken(token);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  } else {
    res.status(401).json({ message: 'Authentication token is required' });
  }
}

// Admin authentication
export async function authenticateAdmin(username, password) {
  try {
    const [admin] = await query(
      'SELECT * FROM Admin WHERE Username = ?',
      [username]
    );

    if (!admin) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, admin.Password);
    if (!isPasswordValid) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticateJWT,
  authenticateAdmin
};
