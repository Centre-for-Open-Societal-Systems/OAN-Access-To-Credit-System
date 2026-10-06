import {
    sendOtpAndCreateConsentResponseSchema,
    submitConsentResponseSchema,
    validateResponse,
    verifyOtpResponseSchema,
    type SendOtpAndCreateConsentResponse,
    type SubmitConsentResponse,
    type VerifyOtpResponse
} from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';
import { normalizeLeadId } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';

export interface ConsentReason {
  id: number;
  name: string;
  description: string;
}

export interface AllowedDataField {
  id: number;
  name: string;
  code: string;
}

const cleanId = (id: string): string => normalizeLeadId(id);

export const consentService = {
  async sendOtpAndCreateConsent(data: { farmerId: string; leadId?: string | undefined }): Promise<SendOtpAndCreateConsentResponse> {
    const payload: { fayda_id: string; lead_id?: string } = {
      fayda_id: data.farmerId,
    };
    if (data.leadId) {
      payload.lead_id = cleanId(data.leadId);
    }
    const response = await fetchApi('v1/consent/otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as ApiResponse<SendOtpAndCreateConsentResponse>;
    return validateResponse(sendOtpAndCreateConsentResponseSchema, response.data, 'consent.request_otp');
  },

  async verifyOtp(data: { leadId?: string | undefined; consent_request: string; otp_code: string }): Promise<VerifyOtpResponse> {
    const payload: { consent_request: string; otp_code: string; lead_id?: string } = {
      consent_request: data.consent_request,
      otp_code: data.otp_code
    };
    if (data.leadId) {
      payload.lead_id = cleanId(data.leadId);
    }
    const response = await fetchApi('v1/consent/otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as ApiResponse<VerifyOtpResponse>;
    return validateResponse(verifyOtpResponseSchema, response.data, 'consent.verify_otp');
  },

  async submitConsent(data: {
    lead_id?: string | undefined;
    consent_request: string;
    consent_type?: string | undefined;
    consent_reason_id?: number | undefined;
    validity_months?: number | undefined;
    consent_form_filename: string;
    consent_form_base64: string;
    allowed_data_field_ids?: (number | string)[] | undefined;
  }): Promise<SubmitConsentResponse> {
    const payload: Record<string, unknown> = { ...data };
    if (data.lead_id) {
      payload.lead_id = cleanId(data.lead_id);
    } else {
      delete payload.lead_id;
    }
    const response = await fetchApi('v1/consent/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as ApiResponse<SubmitConsentResponse>;
    return validateResponse(submitConsentResponseSchema, response.data, 'consent.submit_consent');
  },

  async get_consent_reasons(): Promise<ConsentReason[]> {
    const response = await fetchApi('v1/consent/reasons', {
      method: 'GET',
    }) as ApiResponse<ConsentReason[]>;
    return response.data;
  },

  async get_consent_allowed_fields(): Promise<AllowedDataField[]> {
    const response = await fetchApi('v1/consent/allowed-fields', {
      method: 'GET',
    }) as ApiResponse<AllowedDataField[]>;
    return response.data;
  }
};
