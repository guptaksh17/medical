-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS before_appointment_insert;
DROP TRIGGER IF EXISTS before_appointment_update;

-- Create a trigger that checks for doctor availability before inserting a new appointment
DELIMITER //
CREATE TRIGGER before_appointment_insert
BEFORE INSERT ON Appointment
FOR EACH ROW
BEGIN
    DECLARE doctor_busy INT;
    DECLARE time_start TIME;
    DECLARE time_end TIME;
    DECLARE doctor_name VARCHAR(100);

    -- Calculate the time slot (1 hour window)
    SET time_start = NEW.Time;
    SET time_end = ADDTIME(NEW.Time, '01:00:00');

    -- Check if the doctor is already booked during this time slot
    SELECT COUNT(*) INTO doctor_busy
    FROM Appointment
    WHERE Doctor_ID = NEW.Doctor_ID
      AND Date = NEW.Date
      AND Status IN ('Pending', 'Confirmed')
      AND (
          -- Check if the new appointment time falls within an existing appointment's time slot
          (NEW.Time >= Time AND NEW.Time < ADDTIME(Time, '01:00:00'))
          OR
          -- Check if the new appointment's end time falls within an existing appointment's time slot
          (time_end > Time AND time_end <= ADDTIME(Time, '01:00:00'))
          OR
          -- Check if the new appointment completely overlaps an existing appointment
          (NEW.Time <= Time AND time_end >= ADDTIME(Time, '01:00:00'))
      );

    -- If the doctor is busy, signal a warning with specific details
    IF doctor_busy > 0 THEN
        -- Get the doctor's name
        SELECT Name INTO doctor_name
        FROM Doctor
        WHERE Doctor_ID = NEW.Doctor_ID;

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Warning: Dr. ', doctor_name, ' is already booked on ', DATE_FORMAT(NEW.Date, '%W, %M %d, %Y'), ' at ', TIME_FORMAT(NEW.Time, '%h:%i %p'), '. Please choose another time slot.');
    END IF;
END //
DELIMITER ;

-- Create a trigger that checks for doctor availability before updating an appointment
DELIMITER //
CREATE TRIGGER before_appointment_update
BEFORE UPDATE ON Appointment
FOR EACH ROW
BEGIN
    DECLARE doctor_busy INT;
    DECLARE time_start TIME;
    DECLARE time_end TIME;
    DECLARE doctor_name VARCHAR(100);

    -- Only check if relevant fields are being changed
    IF (NEW.Doctor_ID != OLD.Doctor_ID OR NEW.Date != OLD.Date OR NEW.Time != OLD.Time OR
        (NEW.Status IN ('Pending', 'Confirmed') AND OLD.Status NOT IN ('Pending', 'Confirmed'))) THEN

        -- Calculate the time slot (1 hour window)
        SET time_start = NEW.Time;
        SET time_end = ADDTIME(NEW.Time, '01:00:00');

        -- Check if the doctor is already booked during this time slot (excluding the current appointment)
        SELECT COUNT(*) INTO doctor_busy
        FROM Appointment
        WHERE Doctor_ID = NEW.Doctor_ID
          AND Date = NEW.Date
          AND Status IN ('Pending', 'Confirmed')
          AND Appointment_ID != NEW.Appointment_ID
          AND (
              -- Check if the new appointment time falls within an existing appointment's time slot
              (NEW.Time >= Time AND NEW.Time < ADDTIME(Time, '01:00:00'))
              OR
              -- Check if the new appointment's end time falls within an existing appointment's time slot
              (time_end > Time AND time_end <= ADDTIME(Time, '01:00:00'))
              OR
              -- Check if the new appointment completely overlaps an existing appointment
              (NEW.Time <= Time AND time_end >= ADDTIME(Time, '01:00:00'))
          );

        -- If the doctor is busy, signal a warning with specific details
        IF doctor_busy > 0 THEN
            -- Get the doctor's name
            SELECT Name INTO doctor_name
            FROM Doctor
            WHERE Doctor_ID = NEW.Doctor_ID;

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = CONCAT('Warning: Dr. ', doctor_name, ' is already booked on ', DATE_FORMAT(NEW.Date, '%W, %M %d, %Y'), ' at ', TIME_FORMAT(NEW.Time, '%h:%i %p'), '. Please choose another time slot.');
        END IF;
    END IF;
END //
DELIMITER ;
