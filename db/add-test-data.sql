-- Add test data for the dashboard

-- Add a doctor if none exists
INSERT INTO Doctor (Name, Phone, Address, Expertise, Experience, Gender)
SELECT 'Dr. John Smith', '1234567890', '123 Medical St', 'Cardiology', 10, 'Male'
WHERE NOT EXISTS (SELECT 1 FROM Doctor WHERE Name = 'Dr. John Smith');

-- Add a patient if none exists
INSERT INTO Patient (Name, Blood_Group, DOB, Address, Phone, Email, Password)
SELECT 'Jane Doe', 'O+', '1990-01-01', '456 Patient Ave', '9876543210', 'jane@example.com', SHA2('password123', 256)
WHERE NOT EXISTS (SELECT 1 FROM Patient WHERE Email = 'jane@example.com');

-- Get the IDs
SET @doctor_id = (SELECT Doctor_ID FROM Doctor WHERE Name = 'Dr. John Smith');
SET @patient_id = (SELECT Patient_ID FROM Patient WHERE Email = 'jane@example.com');

-- Add an appointment if none exists
INSERT INTO Appointment (Patient_ID, Doctor_ID, Specialization, Date, Time, Status)
SELECT @patient_id, @doctor_id, 'Cardiology', CURDATE(), '10:00:00', 'Confirmed'
WHERE NOT EXISTS (
    SELECT 1 FROM Appointment 
    WHERE Patient_ID = @patient_id AND Doctor_ID = @doctor_id AND Date = CURDATE()
);

-- Get the appointment ID
SET @appointment_id = (
    SELECT Appointment_ID FROM Appointment 
    WHERE Patient_ID = @patient_id AND Doctor_ID = @doctor_id AND Date = CURDATE()
);

-- Add feedback if none exists
INSERT INTO Feedback (Appointment_ID, Given_By, Given_By_ID, Receiver_ID, Receiver_Type, Comments, Rating, Date)
SELECT @appointment_id, 'Patient', @patient_id, @doctor_id, 'Doctor', 'Great doctor, very professional!', 5, NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM Feedback 
    WHERE Appointment_ID = @appointment_id AND Given_By = 'Patient' AND Given_By_ID = @patient_id
);
