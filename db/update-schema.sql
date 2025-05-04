-- Update the Appointment table to include 'Completed' status
ALTER TABLE Appointment MODIFY COLUMN Status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending';
