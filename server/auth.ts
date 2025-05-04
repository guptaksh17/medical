import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import { Patient, Admin } from '@shared/schema';

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'appointment_scheduler_secret_key';

// Configure local strategy for username/password authentication
passport.use('admin-local', new LocalStrategy(
  async (username, password, done) => {
    try {
      // Find admin by username
      const admin = await storage.getAdminByUsername(username);

      if (!admin) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      return done(null, { ...admin, role: 'admin' });
    } catch (error) {
      return done(error);
    }
  }
));

// Configure local strategy for patient authentication
passport.use('patient-local', new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Find patient by email
      const patient = await storage.getPatientByEmail(email);

      if (!patient) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, patient.password);

      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, { ...patient, role: 'patient' });
    } catch (error) {
      return done(error);
    }
  }
));

// Configure JWT strategy for token authentication
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}, async (payload: { id: number, username?: string, email?: string, role: string }, done: any) => {
  try {
    if (payload.role === 'admin') {
      // Find admin by username from JWT payload
      const admin = await storage.getAdminByUsername(payload.username || '');

      if (!admin) {
        return done(null, false);
      }

      return done(null, { ...admin, role: 'admin' });
    } else if (payload.role === 'patient') {
      // Find patient by email from JWT payload
      const patient = await storage.getPatientByEmail(payload.email || '');

      if (!patient) {
        return done(null, false);
      }

      return done(null, { ...patient, role: 'patient' });
    }

    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Generate JWT token for admin
export const generateAdminToken = (admin: { id: number, username: string }): string => {
  return jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

// Generate JWT token for patient
export const generatePatientToken = (patient: { id: number, email: string }): string => {
  return jwt.sign(
    { id: patient.id, email: patient.email, role: 'patient' },
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

// Middleware to authenticate JWT token
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware to handle admin login
export const adminLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('admin-local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Authentication failed' });
    }

    // Generate JWT token
    const token = generateAdminToken(user);

    return res.json({ token, user: { id: user.id, username: user.username, role: 'admin' } });
  })(req, res, next);
};

// Middleware to handle patient login
export const patientLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('patient-local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Authentication failed' });
    }

    // Generate JWT token
    const token = generatePatientToken(user);

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'patient' } });
  })(req, res, next);
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
