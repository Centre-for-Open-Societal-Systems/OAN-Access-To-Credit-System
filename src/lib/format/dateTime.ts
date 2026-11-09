import { NO_VALUE } from './loanTerms';

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return NO_VALUE;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
