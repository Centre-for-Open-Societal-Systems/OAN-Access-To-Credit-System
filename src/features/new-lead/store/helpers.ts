// Helper function to handle strict browser parsing and format dates consistently
export const formatTiming = (rawDateStr: string, separator: string = ' - ', appendIST: boolean = false) => {
  if (!rawDateStr) return 'Unknown time';
  const safeDateStr = rawDateStr.replace(' ', 'T');
  const date = new Date(safeDateStr);

  if (isNaN(date.getTime())) return rawDateStr;

  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formattedString = `${formattedDate}${separator}${formattedTime}`;
  return appendIST ? `${formattedString} IST` : formattedString;
};

// Helpers for robust Frappe API payload extraction
// TODO: These utility extraction functions use `any` to handle dynamic API response layouts (e.g. results vs data vs message).
// In a future refactoring session, these should be updated with strict generics once API response payloads are fully standardized.
export const extractList = (payload: any, key: string): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload[key])) return payload[key];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.message)) return payload.message;
  if (payload.message && Array.isArray(payload.message[key])) return payload.message[key];
  if (payload.data && Array.isArray(payload.data[key])) return payload.data[key];

  // Fallback: if it's an object with exactly one key that is an array, return it
  const values = Object.values(payload);
  if (values.length === 1 && Array.isArray(values[0])) return values[0];

  return [];
};

export const extractData = (payload: any): any => {
  if (!payload) return {};
  if (Array.isArray(payload)) return payload;
  return payload.data || payload.results || payload;
};
