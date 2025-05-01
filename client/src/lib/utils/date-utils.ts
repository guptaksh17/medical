import { format, parseISO, isValid } from "date-fns";

/**
 * Formats a date string or Date object into a readable format
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Formats a time string into a readable format
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  try {
    // If time is in HH:MM:SS format, convert to HH:MM AM/PM
    const timeParts = time.split(":");
    if (timeParts.length === 3 || timeParts.length === 2) {
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    }
    return time;
  } catch (error) {
    console.error("Error formatting time:", error);
    return time;
  }
}

/**
 * Converts a date and time to an ISO string
 */
export function toISOStringWithoutTimezone(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return format(newDate, "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Formats a date and time for display
 */
export function formatDateTime(date: string | Date | null | undefined, time: string | null | undefined): string {
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(time);
  
  if (!formattedDate && !formattedTime) return "";
  if (!formattedDate) return formattedTime;
  if (!formattedTime) return formattedDate;
  
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Gets the current date in YYYY-MM-DD format for date inputs
 */
export function getCurrentDateForInput(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Gets the current time in HH:MM format for time inputs
 */
export function getCurrentTimeForInput(): string {
  return format(new Date(), "HH:mm");
}

/**
 * Generates time slots for appointments
 */
export function generateTimeSlots(): { value: string; label: string }[] {
  const slots = [];
  
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, "0");
      const minuteStr = minute.toString().padStart(2, "0");
      const formattedTime = `${hourStr}:${minuteStr}`;
      
      // Skip lunch break (12:30 - 13:30)
      if ((hour === 12 && minute === 30) || (hour === 13 && minute === 0)) {
        continue;
      }
      
      const isPM = hour >= 12;
      const hour12 = hour % 12 || 12;
      const label = `${hour12}:${minuteStr} ${isPM ? "PM" : "AM"}`;
      
      slots.push({ value: formattedTime, label });
    }
  }
  
  return slots;
}

/**
 * Checks if a date is in the past
 */
export function isDateInPast(date: string | Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = typeof date === "string" ? parseISO(date) : date;
  return compareDate < today;
}
