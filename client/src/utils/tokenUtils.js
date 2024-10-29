// src/utils/tokenUtils.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { jwtDecode } from "jwt-decode";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Checks if a JWT token is expired.
 * @param {string} token - The JWT token.
 * @returns {boolean} - Returns true if expired, false otherwise.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = dayjs().unix();
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
};

/**
 * Formats a date string to a specified format and timezone.
 * @param {string} dateString - The date string to format.
 * @param {string} format - The desired date format.
 * @param {string} timeZone - The desired timezone.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (
  dateString,
  format = "MM/DD/YY",
  timeZone = "America/Los_Angeles"
) => {
  if (!dateString) return "";
  return dayjs.tz(dateString, timeZone).utc().format(format);
};
