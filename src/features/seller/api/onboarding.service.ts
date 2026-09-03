import { fetchApi } from '@/lib/api/fetchApi';
import { toProxiedFileUrl } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type {
    RegisterBankPayload,
    RegisterSellerPayload,
    SaveOrgContactsPayload,
    UploadKycDocumentPayload
} from '../types/onboarding.types';

export interface BankProfile {
  bank_id: string;
  bank_code: string;
  bank_name: string;
  brand_name?: string;
  entity_type: string;
  registered_street: string;
  registered_kebele_village?: string;
  registered_woreda_district?: string;
  registered_zone: string;
  registered_region: string;
  registered_postal_code: string;
  registered_email: string;
  registered_phone: string;
  website?: string;
  status: string;
  gro_name?: string;
  gro_mobile?: string;
  ops_name?: string;
  ops_mobile?: string;
  kyc_document?: string;
  kyc_document_uploaded: boolean;
  org_grievance_updated: boolean;
  logo?: string;
}

export interface UpdateBankProfilePayload {
  bank_name?: string;
  brand_name?: string;
  website?: string;
  registered_street?: string;
  registered_kebele_village?: string;
  registered_woreda_district?: string;
  registered_zone?: string;
  registered_region?: string;
  registered_postal_code?: string;
  registered_email?: string;
  registered_phone?: string;
  logo?: string;
}

export const onboardingService = {
  async registerSeller(payload: RegisterSellerPayload): Promise<ApiResponse<{ message: string }>> {
    // Public self-registration endpoint (guest-accessible). `role` is omitted so
    // the backend applies its default (BANK_ADMIN_ROLE), matching this page's intent.
    return fetchApi('oan_a2c.api.v1.auth.register_user', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async registerBank(payload: RegisterBankPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.register_bank', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async saveOrgContacts(payload: SaveOrgContactsPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.save_org_contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async uploadKycDocument(payload: UploadKycDocumentPayload): Promise<ApiResponse<{ message: string; file_url: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.upload_kyc_document', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string; file_url: string }>>;
  },

  async getBankProfile(): Promise<ApiResponse<BankProfile>> {
    const res = await fetchApi('oan_a2c.api.v1.seller.onboarding.get_bank_profile', {
      method: 'GET',
    }) as ApiResponse<BankProfile>;
    if (res?.data?.logo) {
      res.data.logo = toProxiedFileUrl(res.data.logo) ?? res.data.logo;
    }
    return res;
  },

  async updateBankProfile(payload: UpdateBankProfilePayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.update_bank_profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  // Returns the canonical backend file URL. Callers store this (in the product
  // `image` field, bank `logo`, etc.); it is proxied to `/api/files/...` only at
  // read/display time (see `toProxiedFileUrl`), never before persisting.
  async uploadImage(payload: { filename: string; filedata: string }): Promise<ApiResponse<{ message: string; file_url: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.upload_image', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string; file_url: string }>>;
  },
};
