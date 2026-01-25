/**
 * Timezone Utility for Punch'd Admin Dashboard
 * 
 * All times from API are in UTC.
 * This utility converts to/from company timezone for display and input.
 */

// Default timezone (can be overridden by company settings)
export const DEFAULT_TIMEZONE = 'America/Los_Angeles';

/**
 * Get the company timezone from localStorage or default
 */
export function getCompanyTimezone() {
  try {
    const stored = localStorage.getItem('companyTimezone');
    return stored || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Set the company timezone in localStorage
 */
export function setCompanyTimezone(timezone) {
  try {
    localStorage.setItem('companyTimezone', timezone);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get timezone offset string like "-08:00" for a timezone
 */
export function getTimezoneOffsetString(timezone = getCompanyTimezone(), date = new Date()) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offsetMinutes = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
  
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const mins = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '-' : '+';
  return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format a UTC date/time to display in company timezone
 * 
 * @param {Date|string} date - UTC date
 * @param {string} format - 'time' | 'date' | 'datetime' | 'short-date'
 * @param {string} timezone - Optional timezone override
 * @returns {string} Formatted string
 */
export function formatDateTime(date, format = 'datetime', timezone = getCompanyTimezone()) {
  if (!date) return '--';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--';
  
  const options = { timeZone: timezone };
  
  switch (format) {
    case 'time':
      return d.toLocaleTimeString('en-US', {
        ...options,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    
    case 'date':
      return d.toLocaleDateString('en-US', {
        ...options,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    
    case 'short-date':
      return d.toLocaleDateString('en-US', {
        ...options,
        month: 'short',
        day: 'numeric',
      });
    
    case 'iso-date':
      // Returns YYYY-MM-DD in local timezone
      return d.toLocaleDateString('en-CA', options);
    
    case 'iso-time':
      // Returns HH:MM in 24hr format
      return d.toLocaleTimeString('en-GB', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    
    case 'datetime':
    default:
      return d.toLocaleString('en-US', {
        ...options,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
  }
}

/**
 * Parse a local date and time input to UTC ISO string for API
 * 
 * @param {string} dateStr - Date string like "2026-01-25"
 * @param {string} timeStr - Time string like "08:00"
 * @param {string} timezone - Optional timezone override
 * @returns {string} UTC ISO string
 */
export function parseLocalToUTC(dateStr, timeStr, timezone = getCompanyTimezone()) {
  const offsetStr = getTimezoneOffsetString(timezone, new Date(`${dateStr}T12:00:00Z`));
  const isoString = `${dateStr}T${timeStr}:00${offsetStr}`;
  return new Date(isoString).toISOString();
}

/**
 * Get local date and time strings from a UTC date for form inputs
 * 
 * @param {Date|string} date - UTC date
 * @param {string} timezone - Optional timezone override
 * @returns {{ date: string, time: string }} Object with date (YYYY-MM-DD) and time (HH:MM)
 */
export function getLocalInputValues(date, timezone = getCompanyTimezone()) {
  if (!date) return { date: '', time: '' };
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return { date: '', time: '' };
  
  return {
    date: formatDateTime(d, 'iso-date', timezone),
    time: formatDateTime(d, 'iso-time', timezone),
  };
}

/**
 * Format duration in minutes to human readable string
 * 
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted string like "8h 30m"
 */
export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Get start of day in company timezone as UTC
 */
export function getStartOfDay(date, timezone = getCompanyTimezone()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDateStr = d.toLocaleDateString('en-CA', { timeZone: timezone });
  return parseLocalToUTC(localDateStr, '00:00', timezone);
}

/**
 * Get end of day in company timezone as UTC
 */
export function getEndOfDay(date, timezone = getCompanyTimezone()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localDateStr = d.toLocaleDateString('en-CA', { timeZone: timezone });
  const endOfDay = new Date(parseLocalToUTC(localDateStr, '23:59', timezone));
  endOfDay.setSeconds(59, 999);
  return endOfDay.toISOString();
}

/**
 * Format a date range
 */
export function formatDateRange(startDate, endDate, timezone = getCompanyTimezone()) {
  const start = formatDateTime(startDate, 'short-date', timezone);
  const end = formatDateTime(endDate, 'short-date', timezone);
  return `${start} – ${end}`;
}

/**
 * Check if a date is today in the company timezone
 */
export function isToday(date, timezone = getCompanyTimezone()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  const dateStr = d.toLocaleDateString('en-CA', { timeZone: timezone });
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: timezone });
  
  return dateStr === todayStr;
}

// Export US timezone options for dropdowns
export const US_TIMEZONES = [
  { id: 'America/Los_Angeles', name: 'Pacific Time (PT)', offset: 'UTC-8/UTC-7' },
  { id: 'America/Denver', name: 'Mountain Time (MT)', offset: 'UTC-7/UTC-6' },
  { id: 'America/Chicago', name: 'Central Time (CT)', offset: 'UTC-6/UTC-5' },
  { id: 'America/New_York', name: 'Eastern Time (ET)', offset: 'UTC-5/UTC-4' },
  { id: 'America/Anchorage', name: 'Alaska Time (AKT)', offset: 'UTC-9/UTC-8' },
  { id: 'Pacific/Honolulu', name: 'Hawaii Time (HT)', offset: 'UTC-10' },
];
