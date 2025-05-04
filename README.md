# Appointment Scheduler

A web application for scheduling appointments between patients and doctors.

## Features

- Patient management
- Doctor management
- Appointment scheduling
- Feedback system
- Admin dashboard
- Authentication and authorization

## Database Setup

To set up the MySQL database, follow these steps:

1. Make sure you have MySQL installed and running on your system.

2. Run the SQL script to create the database and tables:

```bash
npm run db:setup
```

Or directly:

```bash
mysql -u root -p < db/direct-setup.sql
```

3. If you don't have the `rudraksh_admin` user created, you can create it with:

```sql
CREATE USER 'rudraksh_admin'@'localhost' IDENTIFIED BY 'Kshsrm@1';
GRANT ALL PRIVILEGES ON APPOINTMENT_BOOKING.* TO 'rudraksh_admin'@'localhost';
FLUSH PRIVILEGES;
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd appointment-scheduler
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:

```
DB_HOST=localhost
DB_USER=rudraksh_admin
DB_PASSWORD=Kshsrm@1
DB_NAME=APPOINTMENT_BOOKING
JWT_SECRET=appointment_scheduler_secret_key
PORT=3000
```

## Running the Application

1. Start the development server:

```bash
npm run dev
```

2. The server will be running at http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/login`: Login with username and password
- `POST /api/auth/register`: Register a new admin user

### Patients

- `GET /api/patients`: Get all patients
- `GET /api/patients/search`: Search patients
- `GET /api/patients/:id`: Get a patient by ID
- `POST /api/patients`: Create a new patient
- `PUT /api/patients/:id`: Update a patient
- `DELETE /api/patients/:id`: Delete a patient

### Doctors

- `GET /api/doctors`: Get all doctors
- `GET /api/doctors/search`: Search doctors
- `GET /api/doctors/top-rated`: Get top-rated doctors
- `GET /api/doctors/:id`: Get a doctor by ID
- `POST /api/doctors`: Create a new doctor
- `PUT /api/doctors/:id`: Update a doctor
- `DELETE /api/doctors/:id`: Delete a doctor

### Appointments

- `GET /api/appointments`: Get all appointments
- `GET /api/appointments/:id`: Get an appointment by ID
- `GET /api/appointments/upcoming`: Get upcoming appointments
- `GET /api/appointments/patient/:patientId`: Get appointments for a patient
- `GET /api/appointments/doctor/:doctorId`: Get appointments for a doctor
- `POST /api/appointments`: Create a new appointment
- `PUT /api/appointments/:id`: Update an appointment
- `DELETE /api/appointments/:id`: Delete an appointment

### Feedback

- `GET /api/feedback`: Get all feedback
- `GET /api/feedback/:id`: Get feedback by ID
- `GET /api/feedback/recent`: Get recent feedback
- `GET /api/feedback/appointment/:appointmentId`: Get feedback for an appointment
- `POST /api/feedback`: Create new feedback
- `PUT /api/feedback/:id`: Update feedback
- `DELETE /api/feedback/:id`: Delete feedback

### Dashboard

- `GET /api/dashboard/stats`: Get dashboard statistics

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints, you need to include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

You can obtain a token by logging in with a valid username and password using the `/api/auth/login` endpoint.

## Technologies Used

- Express.js
- Node.js
- MySQL
- JWT Authentication
- bcrypt for password hashing

## Database Schema

The application uses the following database schema:

- **Patient**: Stores patient information
- **Doctor**: Stores doctor information
- **Appointment**: Stores appointment details
- **Schedule**: Maps appointments to patients
- **Feedback**: Stores feedback given by patients to doctors
- **Admin**: Stores admin user credentials

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
