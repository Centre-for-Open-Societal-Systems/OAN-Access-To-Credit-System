import type { AppDispatch, RootState } from '@/store';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BankProfile } from '../api/onboarding.service';

const mockProfile: BankProfile = {
  bank_id: 'A2C-BANK-0001',
  bank_code: 'BNK001',
  bank_name: 'Test Bank',
  brand_name: 'Test Brand',
  entity_type: 'Bank',
  registered_street: 'Main St',
  registered_zone: 'Zone 1',
  registered_region: 'Region 1',
  registered_postal_code: '1000',
  registered_email: 'test@bank.com',
  registered_phone: '+251911000000',
  status: 'In Review',
  gro_name: 'GRO Person',
  gro_mobile: '+251911111111',
  ops_name: 'OPS Person',
  ops_mobile: '+251922222222',
  kyc_document: '/api/proxy/v1/banks/me/kyc-documents',
  kyc_document_uploaded: true,
  org_grievance_updated: true,
};

const serviceMock = {
  registerSeller: vi.fn(),
  registerBank: vi.fn(),
  saveOrgContacts: vi.fn(async () => ({ data: { message: 'Success' } })),
  uploadKycDocument: vi.fn(async () => ({ data: { message: 'Success', file_url: '/api/proxy/v1/banks/me/kyc-documents' } })),
  getBankProfile: vi.fn(async () => ({ data: mockProfile })),
  updateBankProfile: vi.fn(),
  uploadImage: vi.fn(),
};

vi.mock('../api/onboarding.service', () => ({
  onboardingService: serviceMock,
}));

const {
  fetchBankProfile,
  saveOrgContacts,
  uploadKycDocument,
  selectBankProfile,
  selectBankProfileStatus,
  selectBankProfileError,
  sellerOnboardingReducer,
} = await import('./onboardingSlice');

function createTestStore() {
  return configureStore({
    reducer: {
      sellerOnboarding: sellerOnboardingReducer,
    },
  });
}

describe('onboardingSlice — bankProfile and KYC flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and populates bank profile and KYC document URL', async () => {
    const store = createTestStore();
    expect(selectBankProfileStatus(store.getState() as unknown as RootState)).toBe('idle');
    expect(selectBankProfile(store.getState() as unknown as RootState)).toBeNull();

    await (store.dispatch as AppDispatch)(fetchBankProfile());

    const state = store.getState() as unknown as RootState;
    expect(selectBankProfileStatus(state)).toBe('succeeded');
    expect(selectBankProfile(state)).toEqual(mockProfile);
    expect(selectBankProfile(state)?.kyc_document).toBe('/api/proxy/v1/banks/me/kyc-documents');
  });

  it('handles fetchBankProfile rejection', async () => {
    serviceMock.getBankProfile.mockRejectedValueOnce(new Error('Network error'));
    const store = createTestStore();

    await (store.dispatch as AppDispatch)(fetchBankProfile());

    const state = store.getState() as unknown as RootState;
    expect(selectBankProfileStatus(state)).toBe('failed');
    expect(selectBankProfileError(state)).toBe('Network error');
  });

  it('updates bankProfile when uploadKycDocument succeeds', async () => {
    const store = createTestStore();
    await (store.dispatch as AppDispatch)(fetchBankProfile());

    await (store.dispatch as AppDispatch)(
      uploadKycDocument({ filename: 'replacement.pdf', filedata: 'base64pdf' })
    );

    const state = store.getState() as unknown as RootState;
    expect(selectBankProfile(state)?.kyc_document).toBe('/api/proxy/v1/banks/me/kyc-documents');
    expect(selectBankProfile(state)?.kyc_document_uploaded).toBe(true);
  });

  it('updates bankProfile when saveOrgContacts succeeds', async () => {
    const store = createTestStore();
    await (store.dispatch as AppDispatch)(fetchBankProfile());

    await (store.dispatch as AppDispatch)(
      saveOrgContacts({
        gro_name: 'New GRO',
        gro_mobile: '+251999999999',
        ops_name: 'New OPS',
        ops_mobile: '+251988888888',
      })
    );

    const profile = selectBankProfile(store.getState() as unknown as RootState);
    expect(profile?.org_grievance_updated).toBe(true);
    expect(profile?.gro_name).toBe('New GRO');
    expect(profile?.gro_mobile).toBe('+251999999999');
    expect(profile?.ops_name).toBe('New OPS');
    expect(profile?.ops_mobile).toBe('+251988888888');
  });
});
