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

/**
 * The canonical same-origin URL for the current bank's KYC document.
 *
 * The document is not a `/files/...` asset with a stable path — it is streamed
 * by a dedicated endpoint, so `toProxiedFileUrl` has nothing to rewrite. This
 * is the single place that spelling lives; callers that need an inline preview
 * pass `{ inline: true }` rather than appending `?view=1` themselves.
 */
export const KYC_DOCUMENT_PATH = '/api/proxy/v1/banks/me/kyc-documents';

export function getKycDocumentUrl(options?: { inline?: boolean }): string {
  return options?.inline ? `${KYC_DOCUMENT_PATH}?view=1` : KYC_DOCUMENT_PATH;
}

/** True when `url` points at the KYC-document endpoint rather than a stored file. */
export function isKycDocumentUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.split('?')[0] === KYC_DOCUMENT_PATH);
}

export const onboardingService = {
  getKycDocumentUrl,

  async registerSeller(payload: RegisterSellerPayload): Promise<ApiResponse<{ message: string }>> {
    // Public self-registration endpoint (guest-accessible). `role` is omitted so
    // the backend applies its default (BANK_ADMIN_ROLE), matching this page's intent.
    return fetchApi('v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async registerBank(payload: RegisterBankPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('v1/banks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async saveOrgContacts(payload: SaveOrgContactsPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('v1/banks/me/contacts', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async uploadKycDocument(payload: UploadKycDocumentPayload): Promise<ApiResponse<{ message: string; file_url: string }>> {
    const res = await fetchApi('v1/banks/me/kyc-documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as ApiResponse<{ message: string; file_url: string }>;
    if (res?.data) {
      res.data.file_url = getKycDocumentUrl();
    }
    return res;
  },

  async getBankProfile(): Promise<ApiResponse<BankProfile>> {
    const res = await fetchApi('v1/banks/me', {
      method: 'GET',
    }) as ApiResponse<BankProfile>;
    if (res?.data?.logo) {
      res.data.logo = toProxiedFileUrl(res.data.logo) ?? res.data.logo;
    }
    if (res?.data?.kyc_document_uploaded || res?.data?.kyc_document) {
      res.data.kyc_document = getKycDocumentUrl();
    }
    return res;
  },

  async updateBankProfile(payload: UpdateBankProfilePayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('v1/banks/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  // Returns the canonical backend file URL. Callers store this (in the product
  // `image` field, bank `logo`, etc.); it is proxied to `/api/files/...` only at
  // read/display time (see `toProxiedFileUrl`), never before persisting.
  async uploadImage(payload: { filename: string; filedata: string }): Promise<ApiResponse<{ message: string; file_url: string }>> {
    return fetchApi('v1/images', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string; file_url: string }>>;
  },
};
