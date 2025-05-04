-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_doctor_availability;
DROP TRIGGER IF EXISTS check_doctor_availability_update;

-- Create a trigger that checks if a doctor is already booked for a specific time slot
CREATE TRIGGER check_doctor_availability
BEFORE INSERT ON Appointment
FOR EACH ROW
BEGIN
    DECLARE doctor_busy INT;
    
    -- Check if the doctor already has an appointment at the same date and time
    SELECT COUNT(*) INTO doctor_busy
    FROM Appointment
    WHERE Doctor_ID = NEW.Doctor_ID
    AND Date = NEW.Date
    AND Time = NEW.Time
    AND Status IN ('Confirmed', 'Pending');
    
    -- If the doctor is already busy, raise an error
    IF doctor_busy > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Warning: Doctor is already booked at this time slot';
    END IF;
END;

-- Create a similar trigger for updates to prevent changing an appointment to a busy slot
CREATE TRIGGER check_doctor_availability_update
BEFORE UPDATE ON Appointment
FOR EACH ROW
BEGIN
    DECLARE doctor_busy INT;
    
    -- Only check if the appointment is being changed to a different doctor, date, or time
    -- and if the status is being set to Confirmed or Pending
    IF (NEW.Doctor_ID != OLD.Doctor_ID OR NEW.Date != OLD.Date OR NEW.Time != OLD.Time)
       AND (NEW.Status = 'Confirmed' OR NEW.Status = 'Pending') THEN
        
        -- Check if the doctor already has an appointment at the same date and time (excluding this one)
        SELECT COUNT(*) INTO doctor_busy
        FROM Appointment
        WHERE Doctor_ID = NEW.Doctor_ID
        AND Date = NEW.Date
        AND Time = NEW.Time
        AND Appointment_ID != NEW.Appointment_ID
        AND Status IN ('Confirmed', 'Pending');
        
        -- If the doctor is already busy, raise an error
        IF doctor_busy > 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Warning: Doctor is already booked at this time slot';
        END IF;
    END IF;
END;
