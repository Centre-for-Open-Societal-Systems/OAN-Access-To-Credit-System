import { describe, expect, it } from 'vitest';
import { createLeadSchema } from './lead.schema';

describe('createLeadSchema', () => {
  it('passes a clean 9-digit number through unchanged', () => {
    const result = createLeadSchema.safeParse({ phoneNumber: '911000000' });

    expect(result.success).toBe(true);
    expect(result.success && result.data.phoneNumber).toBe('911000000');
  });

  it('strips spaces, dashes, and parentheses before validating', () => {
    const result = createLeadSchema.safeParse({ phoneNumber: '(911) 000-000' });

    expect(result.success).toBe(true);
    expect(result.success && result.data.phoneNumber).toBe('911000000');
  });

  it('rejects a number that is too short even after sanitizing', () => {
    const result = createLeadSchema.safeParse({ phoneNumber: '123' });

    expect(result.success).toBe(false);
  });

  it('rejects a number that is too long even after sanitizing', () => {
    const result = createLeadSchema.safeParse({ phoneNumber: '09110000001234567' });

    expect(result.success).toBe(false);
  });

  it('drops a pasted trunk 0 or +251 prefix', () => {
    for (const phoneNumber of ['0911000000', '+251911000000']) {
      const result = createLeadSchema.safeParse({ phoneNumber });

      expect(result.success && result.data.phoneNumber).toBe('911000000');
    }
  });

  it('rejects non-numeric input', () => {
    const result = createLeadSchema.safeParse({ phoneNumber: 'not-a-phone-number' });

    expect(result.success).toBe(false);
  });
});
