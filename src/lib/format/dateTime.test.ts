import { describe, expect, it } from 'vitest';

import { formatDateTime } from './dateTime';
import { NO_VALUE } from './loanTerms';

describe('formatDateTime', () => {
  it('renders an ISO timestamp as a readable date and time', () => {
    expect(formatDateTime('2026-10-15T21:27:40.373371')).toBe('Oct 15, 2026, 9:27 PM');
  });

  it('drops the sub-minute precision and the raw ISO shape', () => {
    const out = formatDateTime('2026-10-15T21:27:40.373371+03:00');
    expect(out).not.toContain('T21');
    expect(out).not.toContain('373371');
  });

  it('shows a dash when there is no value', () => {
    expect(formatDateTime(undefined)).toBe(NO_VALUE);
    expect(formatDateTime(null)).toBe(NO_VALUE);
    expect(formatDateTime('')).toBe(NO_VALUE);
  });

  it('returns an unparseable value as received', () => {
    expect(formatDateTime('not a date')).toBe('not a date');
  });
});
