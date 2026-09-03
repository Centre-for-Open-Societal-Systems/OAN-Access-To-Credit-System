import { logger } from '@/lib/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  farmerLoanApplicationSchema,
    loanApplicationFullSchema, loanApplicationSummarySchema, validateResponse
} from './api.schemas';

describe('api.schemas validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateResponse', () => {
    it('should pass and return validated data when input conforms to schema', () => {
      const mockSchema = z.object({ id: z.string() });
      const input = { id: 'test-id' };
      const result = validateResponse(mockSchema, input, 'test_endpoint');
      expect(result).toEqual(input);
    });

    it('should throw an error and log api contract violation when input does not conform to schema', () => {
      const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
      const mockSchema = z.object({ id: z.string() });
      const input = { id: 123 }; // invalid type

      expect(() => validateResponse(mockSchema, input, 'test_endpoint')).toThrow(
        'Data format error in response from test_endpoint. Please try again later.'
      );
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('loanApplicationSummarySchema', () => {
    it('should validate correctly with valid fields and default null/missing values', () => {
      const validData = {
        application_id: 'APP-123',
        status: 'Credit Committee' as const,
        step: 1,
        lead_id: 'LEAD-123',
        loan_amount: 1000,
        loan_type: 'Agri',
        region: 'Oromia',
        woreda: 'Adama',
        kebele: '01',
        phone_number: '1234567890',
        creation: '2026-06-24',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = loanApplicationSummarySchema.parse(validData);
      // The three location levels are carried through as sent, not blanked: they
      // are the row's own values, and only a missing one resolves to undefined.
      expect(result).toEqual({
        ...validData,
        is_terminal: false,
        is_successful: false,
      });
    });

    it('should leave null location and name fields undefined', () => {
      const inputData = {
        application_id: 'APP-123',
        status: 'Active' as const,
        step: 1,
        lead_id: 'LEAD-123',
        loan_amount: 1000,
        loan_type: 'Agri',
        region: null,
        woreda: null,
        kebele: null,
        phone_number: '1234567890',
        creation: '2026-06-24',
        first_name: null,
        last_name: null,
      };

      const result = loanApplicationSummarySchema.parse(inputData);
      // Not '' — a blank string renders as a real but empty value, which is how the
      // never-populated `location` field used to read as a legitimately empty cell.
      expect(result.region).toBeUndefined();
      expect(result.woreda).toBeUndefined();
      expect(result.kebele).toBeUndefined();
      expect(result.first_name).toBeUndefined();
      expect(result.last_name).toBeUndefined();
    });

    it('should handle missing optional fields', () => {
      const inputData = {
        application_id: 'APP-123',
        status: 'Active' as const,
        step: 1,
        lead_id: 'LEAD-123',
        loan_amount: 1000,
        loan_type: 'Agri',
        phone_number: '1234567890',
        creation: '2026-06-24',
      };

      const result = loanApplicationSummarySchema.parse(inputData);
      expect(result.region).toBeUndefined();
      expect(result.first_name).toBeUndefined();
      expect(result.last_name).toBeUndefined();
    });

    it('should reject a `location` field, which no longer exists on the doctype', () => {
      const parsed = loanApplicationSummarySchema.parse({
        application_id: 'APP-123',
        status: 'Active' as const,
        step: 1,
        loan_amount: 1000,
        loan_type: 'Agri',
        phone_number: '1234567890',
        creation: '2026-06-24',
        location: 'Kabul',
      });

      expect(parsed).not.toHaveProperty('location');
    });

    it('should fall back to "Unknown" when status is null or missing', () => {
      const parsedNull = loanApplicationSummarySchema.parse({
        application_id: 'APP-123',
        creation: '2026-06-24',
        status: null,
      });
      expect(parsedNull.status).toBe('Unknown');

      const parsedUndefined = loanApplicationSummarySchema.parse({
        application_id: 'APP-123',
        creation: '2026-06-24',
      });
      expect(parsedUndefined.status).toBe('Unknown');
    });
  });

  describe('loanApplicationFullSchema', () => {
    it('should transform nullish name, reason and status fields', () => {
      const inputData = {
        application_id: 'APP-123',
        status: null,
        phone_number: '1234567890',
        loan_type: 'Agri',
        loan_amount: 1000,
        loan_reason: null,
        first_name: null,
        last_name: null,
        farmer_profile: null,
        loan_officer: null,
        gender: null,
        marital_status: null,
        education_level: null,
      };

      const result = loanApplicationFullSchema.parse(inputData);
      expect(result.status).toBe('Unknown');
      expect(result.loan_reason).toBe('');
      expect(result.first_name).toBeUndefined();
      expect(result.last_name).toBeUndefined();
      expect(result.farmer_profile).toBeUndefined();
      expect(result.loan_officer).toBeUndefined();
      expect(result.gender).toBeUndefined();
      expect(result.marital_status).toBeUndefined();
      expect(result.education_level).toBeUndefined();
    });
  });

  describe('farmerLoanApplicationSchema', () => {
    const validRow = {
      application_id: 'APP-123',
      status: 'Credit Committee',
      creation: '2026-01-01 10:00:00',
      requested_amount: 5000,
      loan_product: 'PROD-1',
      loan_product_name: 'Crop Loan',
      bank: 'Coop Bank',
    };

    it('accepts a farmer row and leaves missing optional fields undefined', () => {
      const result = farmerLoanApplicationSchema.parse({
        application_id: 'APP-123',
        status: 'Active',
        creation: '2026-01-01 10:00:00',
      });

      expect(result.requested_amount).toBeUndefined();
      expect(result.loan_product).toBeUndefined();
      expect(result.loan_product_name).toBeUndefined();
      expect(result.bank).toBeUndefined();
    });

    it('keeps null amounts, product names, banks and terms as null without fake defaults', () => {
      const result = farmerLoanApplicationSchema.parse({
        ...validRow,
        requested_amount: null,
        loan_product_name: null,
        bank: null,
        interest_rate: null,
        tenure_months: null,
      });
      expect(result.requested_amount).toBeNull();
      expect(result.loan_product_name).toBeNull();
      expect(result.bank).toBeNull();
      expect(result.interest_rate).toBeNull();
      expect(result.tenure_months).toBeNull();
    });

    it('falls back to "Unknown" when status is null or missing', () => {
      const resultNull = farmerLoanApplicationSchema.parse({ ...validRow, status: null });
      expect(resultNull.status).toBe('Unknown');

      const resultUndefined = farmerLoanApplicationSchema.parse({ ...validRow, status: undefined });
      expect(resultUndefined.status).toBe('Unknown');
    });

    it('inherits the summary schema fields', () => {
      const result = farmerLoanApplicationSchema.parse({
        ...validRow,
        stage_id: 'LSS-00021',
        sequence: 2,
        is_terminal: null,
      });
      expect(result.stage_id).toBe('LSS-00021');
      expect(result.sequence).toBe(2);
      expect(result.is_terminal).toBe(false);
    });
  });
});
