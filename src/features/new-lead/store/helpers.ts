// Helper function to handle strict browser parsing and format dates consistently.
// Timestamps are rendered in Ethiopia's timezone (EAT, UTC+3) using ISO 8601
// formatting so they read the same regardless of the viewer's browser locale.
const APP_TIME_ZONE = 'Africa/Addis_Ababa';
const APP_TIME_ZONE_LABEL = 'EAT';

export const formatTiming = (rawDateStr: string, separator: string = ' - ', appendTimezone: boolean = false): string => {
  if (!rawDateStr) return 'Unknown time';
  const safeDateStr = rawDateStr.replace(' ', 'T');
  const date = new Date(safeDateStr);

  if (isNaN(date.getTime())) return rawDateStr;

  // ISO 8601: YYYY-MM-DD (en-CA) date and 24-hour HH:mm time, both in EAT.
  const formattedDate = date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: APP_TIME_ZONE,
  });
  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIME_ZONE,
  });

  const formattedString = `${formattedDate}${separator}${formattedTime}`;
  return appendTimezone ? `${formattedString} ${APP_TIME_ZONE_LABEL}` : formattedString;
};

// Formats a date-only value in Ethiopia's timezone (EAT) using ISO 8601
// (YYYY-MM-DD) so the recorded consent date does not depend on the viewer's
// browser clock or locale.
export const formatConsentDate = (rawDateStr?: string): string => {
  const date = rawDateStr ? new Date(rawDateStr.replace(' ', 'T')) : new Date();

  if (isNaN(date.getTime())) return rawDateStr ?? '';

  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: APP_TIME_ZONE,
  });
};
