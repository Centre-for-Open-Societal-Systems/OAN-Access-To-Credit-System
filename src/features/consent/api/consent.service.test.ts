import { describe, expect, it, vi, beforeEach } from 'vitest';
import { consentService } from './consent.service';
import { fetchApi } from '@/lib/api/fetchApi';

vi.mock('@/lib/api/fetchApi');

describe('consentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendOtpAndCreateConsent', () => {
    it('should call OTP api and return data', async () => {
      const mockResponse = {
        data: {
          consent_request: 'REQ-123',
          transaction_id: 'TX-999',
          masked_phone: '******7890',
        },
      };

      vi.mocked(fetchApi).mockResolvedValue(mockResponse);

      const result = await consentService.sendOtpAndCreateConsent({
        farmerId: 'FID-123',
        leadId: 'LD-12345',
      });

      expect(fetchApi).toHaveBeenCalledWith('v1/consent/otp', {
        method: 'POST',
        body: '{"fayda_id":"FID-123","lead_id":"LD-12345"}',
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return consent details', async () => {
      const mockResponse = {
        data: {
          lead_id: 'LD-12345',
          consent_request: 'REQ-123',
          transaction_id: 'TX-999',
          status: 'OTP Verified',
        },
      };

      vi.mocked(fetchApi).mockResolvedValue(mockResponse);

      const result = await consentService.verifyOtp({
        leadId: 'LD-12345',
        consent_request: 'REQ-123',
        otp_code: '123456',
      });

      expect(fetchApi).toHaveBeenCalledWith('v1/consent/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          consent_request: 'REQ-123',
          otp_code: '123456',
          lead_id: 'LD-12345',
        }),
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('submitConsent', () => {
    it('should submit consent with provided details', async () => {
      const mockResponse = {
        data: {
          openg2p_consent_id: 'G2P-456',
        },
      };

      vi.mocked(fetchApi).mockResolvedValue(mockResponse);

      const payload = {
        lead_id: 'LD-12345',
        consent_request: 'REQ-123',
        consent_type: 'specific',
        consent_reason_id: 1,
        validity_months: 12,
        consent_form_filename: 'signed_consent.pdf',
        consent_form_base64: 'base64encodedstring',
        allowed_data_field_ids: [1, 2, 3],
      };

      const result = await consentService.submitConsent(payload);

      expect(fetchApi).toHaveBeenCalledWith('v1/consent/requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      expect(result).toEqual(mockResponse.data);
    });
  });
});
