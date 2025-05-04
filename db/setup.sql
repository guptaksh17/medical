-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS APPOINTMENT_BOOKING;
USE APPOINTMENT_BOOKING;

-- Patient Table
CREATE TABLE IF NOT EXISTS Patient (
    Patient_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255),
    Blood_Group VARCHAR(10),
    DOB DATE,
    Address TEXT,
    Phone VARCHAR(10),
    Email VARCHAR(255) UNIQUE,
    CONSTRAINT chk_phone_digits CHECK (Phone REGEXP '^[0-9]{10}$')
);

-- Doctor Table
CREATE TABLE IF NOT EXISTS Doctor (
    Doctor_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255),
    Phone VARCHAR(10),
    Address TEXT,
    Expertise VARCHAR(100),
    Experience INT,
    Gender VARCHAR(10)
);

-- Appointment Table
CREATE TABLE IF NOT EXISTS Appointment (
    Appointment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Doctor_ID INT,
    Specialization VARCHAR(100),
    Date DATE,
    Time TIME,
    Status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID),
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID)
);

-- Schedule Table (Mapping Appointment and Patient)
CREATE TABLE IF NOT EXISTS Schedule (
    Appointment_ID INT,
    Patient_ID INT,
    PRIMARY KEY (Appointment_ID, Patient_ID),
    FOREIGN KEY (Appointment_ID) REFERENCES Appointment(Appointment_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS Feedback (
    Feedback_ID INT PRIMARY KEY AUTO_INCREMENT,
    Appointment_ID INT,
    Given_By ENUM('Patient', 'Doctor'),
    Given_By_ID INT,
    Receiver_ID INT,
    Receiver_Type ENUM('Doctor', 'Patient'),
    Comments TEXT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Appointment_ID) REFERENCES Appointment(Appointment_ID)
);

-- Admin Table
CREATE TABLE IF NOT EXISTS Admin (
    Admin_ID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL -- hashed password
);

-- Create Admin User if it doesn't exist
CREATE USER IF NOT EXISTS 'rudraksh_admin'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'Kshsrm@1';
GRANT ALL PRIVILEGES ON APPOINTMENT_BOOKING.* TO 'rudraksh_admin'@'localhost';
FLUSH PRIVILEGES;

-- Insert Admin credentials if not already present
INSERT INTO Admin (Username, Password) 
SELECT 'rudraksh_admin', SHA2('RUDRAKSH2005.', 256)
WHERE NOT EXISTS (SELECT 1 FROM Admin WHERE Username = 'rudraksh_admin');

-- Insert Sample Data if tables are empty
INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email)
SELECT 'Rahul Sharma', 'O+', '1995-07-12', 'Mumbai, India', '9876543210', 'rahul.sharma@example.com'
WHERE NOT EXISTS (SELECT 1 FROM Patient);

INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email)
SELECT 'Ayesha Khan', 'A-', '1992-04-25', 'Delhi, India', '8765432109', 'ayesha.khan@example.com'
WHERE (SELECT COUNT(*) FROM Patient) < 2;

INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email)
SELECT 'Vikram Singh', 'B+', '1988-10-08', 'Bangalore, India', '7654321098', 'vikram.singh@example.com'
WHERE (SELECT COUNT(*) FROM Patient) < 3;

INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email)
SELECT 'Meera Iyer', 'AB+', '1996-01-15', 'Chennai, India', '6543210987', 'meera.iyer@example.com'
WHERE (SELECT COUNT(*) FROM Patient) < 4;

INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email)
SELECT 'Sandeep Verma', 'A+', '1985-06-30', 'Pune, India', '5432109876', 'sandeep.verma@example.com'
WHERE (SELECT COUNT(*) FROM Patient) < 5;

-- Insert Doctors if table is empty
INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender)
SELECT 'Dr. Arjun Kapoor', '9123456789', 'Delhi, India', 'Cardiology', 15, 'Male'
WHERE NOT EXISTS (SELECT 1 FROM Doctor);

INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender)
SELECT 'Dr. Neha Malhotra', '9234567890', 'Mumbai, India', 'Dermatology', 10, 'Female'
WHERE (SELECT COUNT(*) FROM Doctor) < 2;

INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender)
SELECT 'Dr. Ravi Gupta', '9345678901', 'Bangalore, India', 'Orthopedics', 12, 'Male'
WHERE (SELECT COUNT(*) FROM Doctor) < 3;

INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender)
SELECT 'Dr. Sunita Desai', '9456789012', 'Chennai, India', 'Pediatrics', 8, 'Female'
WHERE (SELECT COUNT(*) FROM Doctor) < 4;

INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender)
SELECT 'Dr. Anil Joshi', '9567890123', 'Pune, India', 'General Medicine', 20, 'Male'
WHERE (SELECT COUNT(*) FROM Doctor) < 5;

-- Insert Appointments if table is empty
INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status)
SELECT 1, 1, 'Cardiology', '2025-03-10', '10:30:00', 'Confirmed'
WHERE NOT EXISTS (SELECT 1 FROM Appointment);

INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status)
SELECT 2, 2, 'Dermatology', '2025-03-11', '14:00:00', 'Confirmed'
WHERE (SELECT COUNT(*) FROM Appointment) < 2;

INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status)
SELECT 3, 3, 'Orthopedics', '2025-03-12', '09:00:00', 'Cancelled'
WHERE (SELECT COUNT(*) FROM Appointment) < 3;

INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status)
SELECT 4, 4, 'Pediatrics', '2025-03-13', '11:15:00', 'Confirmed'
WHERE (SELECT COUNT(*) FROM Appointment) < 4;

INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status)
SELECT 5, 5, 'General Medicine', '2025-03-14', '16:30:00', 'Confirmed'
WHERE (SELECT COUNT(*) FROM Appointment) < 5;

-- Insert Schedules for confirmed appointments if table is empty
INSERT INTO Schedule (Appointment_ID, Patient_ID)
SELECT 1, 1
WHERE NOT EXISTS (SELECT 1 FROM Schedule);

INSERT INTO Schedule (Appointment_ID, Patient_ID)
SELECT 2, 2
WHERE (SELECT COUNT(*) FROM Schedule) < 2;

INSERT INTO Schedule (Appointment_ID, Patient_ID)
SELECT 4, 4
WHERE (SELECT COUNT(*) FROM Schedule) < 3;

INSERT INTO Schedule (Appointment_ID, Patient_ID)
SELECT 5, 5
WHERE (SELECT COUNT(*) FROM Schedule) < 4;

-- Insert Feedback if table is empty
INSERT INTO Feedback (Appointment_ID, Given_By, Given_By_ID, Receiver_ID, Receiver_Type, Comments, Rating)
SELECT 1, 'Patient', 1, 1, 'Doctor', 'Very knowledgeable and helpful doctor!', 5
WHERE NOT EXISTS (SELECT 1 FROM Feedback);

INSERT INTO Feedback (Appointment_ID, Given_By, Given_By_ID, Receiver_ID, Receiver_Type, Comments, Rating)
SELECT 2, 'Patient', 2, 2, 'Doctor', 'Great experience, highly recommended.', 4
WHERE (SELECT COUNT(*) FROM Feedback) < 2;

INSERT INTO Feedback (Appointment_ID, Given_By, Given_By_ID, Receiver_ID, Receiver_Type, Comments, Rating)
SELECT 4, 'Patient', 4, 4, 'Doctor', 'Very friendly and patient with my child.', 5
WHERE (SELECT COUNT(*) FROM Feedback) < 3;

INSERT INTO Feedback (Appointment_ID, Given_By, Given_By_ID, Receiver_ID, Receiver_Type, Comments, Rating)
SELECT 5, 'Patient', 5, 5, 'Doctor', 'Professional and efficient service.', 4
WHERE (SELECT COUNT(*) FROM Feedback) < 4;

-- Create Views
CREATE OR REPLACE VIEW Upcoming_Confirmed_Appointments AS
SELECT 
    A.Appointment_ID, 
    P.Name AS Patient_Name, 
    D.Name AS Doctor_Name, 
    A.Date, 
    A.Time
FROM Appointment A
JOIN Patient P ON A.Patient_ID = P.Patient_ID
JOIN Doctor D ON A.Doctor_ID = D.Doctor_ID
WHERE A.Status = 'Confirmed' AND A.Date >= CURDATE();

-- Create Triggers
DELIMITER //

-- Trigger to insert into Schedule after Appointment is created with Confirmed status
DROP TRIGGER IF EXISTS insert_schedule_after_appointment //
CREATE TRIGGER insert_schedule_after_appointment
AFTER INSERT ON Appointment
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Confirmed' THEN
        INSERT INTO Schedule (Appointment_ID, Patient_ID)
        VALUES (NEW.Appointment_ID, NEW.Patient_ID);
    END IF;
END;
//

-- Trigger to prevent double booking
DROP TRIGGER IF EXISTS prevent_doctor_double_booking //
CREATE TRIGGER prevent_doctor_double_booking
BEFORE INSERT ON Appointment
FOR EACH ROW
BEGIN
    DECLARE appointment_exists INT;

    SELECT COUNT(*) INTO appointment_exists
    FROM Appointment
    WHERE Doctor_ID = NEW.Doctor_ID
      AND Date = NEW.Date
      AND Time = NEW.Time
      AND Status = 'Confirmed';

    IF appointment_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Doctor is busy on this date and time. Please select another slot.';
    END IF;
END;
//

DELIMITER ;

-- Create Stored Procedure
DELIMITER //

DROP PROCEDURE IF EXISTS UpdateExperienceForTopDoctors //
CREATE PROCEDURE UpdateExperienceForTopDoctors()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE doc_id INT;
    DECLARE cur CURSOR FOR 
        SELECT DISTINCT Receiver_ID 
        FROM Feedback 
        WHERE Rating = 5 
        AND Receiver_ID NOT IN (
            SELECT Receiver_ID FROM Feedback WHERE Rating < 5
        );
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO doc_id;
        IF done THEN 
            LEAVE read_loop;
        END IF;

        UPDATE Doctor SET Experience = Experience + 1
        WHERE Doctor_ID = doc_id;
    END LOOP;

    CLOSE cur;
END;
//

DELIMITER ;
