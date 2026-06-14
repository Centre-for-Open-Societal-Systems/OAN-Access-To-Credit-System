// Helper function to handle strict browser parsing and format dates consistently
export const formatTiming = (rawDateStr: string, separator: string = ' - ', appendIST: boolean = false): string => {
  if (!rawDateStr) return 'Unknown time';
  const safeDateStr = rawDateStr.replace(' ', 'T');
  const date = new Date(safeDateStr);

  if (isNaN(date.getTime())) return rawDateStr;

  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formattedString = `${formattedDate}${separator}${formattedTime}`;
  return appendIST ? `${formattedString} IST` : formattedString;
};
