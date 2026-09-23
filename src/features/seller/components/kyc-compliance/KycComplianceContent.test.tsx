import { authReducer } from '@/features/auth/store/authSlice';
import type { AuthState, User } from '@/features/auth/types/auth.types';
import type { BankProfile } from '@/features/seller/api/onboarding.service';
import { sellerOnboardingReducer } from '@/features/seller/store/onboardingSlice';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KycComplianceContent } from './KycComplianceContent';

const { mockProfile, serviceMock } = vi.hoisted(() => {
  const mockProfile: BankProfile = {
    bank_id: 'A2C-BANK-0001',
    bank_code: 'BNK001',
    bank_name: 'Awash Bank',
    brand_name: 'Awash',
    entity_type: 'Bank',
    registered_street: 'Ras Abebe Aregay St',
    registered_zone: 'Kirkos',
    registered_region: 'Addis Ababa',
    registered_postal_code: '1000',
    registered_email: 'compliance@awashbank.com',
    registered_phone: '+251911234567',
    status: 'In Review',
    gro_name: 'Abebe Kebede',
    gro_mobile: '+251911000001',
    ops_name: 'Tigist Haile',
    ops_mobile: '+251911000002',
    kyc_document: '/api/files/private/tax_cert.pdf',
    kyc_document_uploaded: true,
    org_grievance_updated: true,
  };

  const serviceMock = {
    getBankProfile: vi.fn(async () => ({ data: mockProfile })),
    saveOrgContacts: vi.fn(),
    uploadKycDocument: vi.fn(),
    registerBank: vi.fn(),
    registerSeller: vi.fn(),
    updateBankProfile: vi.fn(),
    uploadImage: vi.fn(),
  };

  return { mockProfile, serviceMock };
});

// Partial mock: only the network-calling service object is stubbed. The pure
// URL helpers (getKycDocumentUrl / isKycDocumentUrl) are real, since the
// components under test use them to decide how to render the document.
vi.mock('@/features/seller/api/onboarding.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/seller/api/onboarding.service')>()),
  onboardingService: serviceMock,
}));

function renderWithStore(initialUser: Partial<Extract<User, { kind: 'bank_admin' }>> = {}) {
  const user: User = {
    kind: 'bank_admin',
    email: 'admin@awashbank.com',
    name: 'Bank Admin',
    bankId: 'A2C-BANK-0001',
    bankCode: 'BNK001',
    bankName: 'Awash Bank',
    bankStatus: 'In Review',
    ...initialUser,
  };

  const store = configureStore({
    reducer: {
      auth: authReducer,
      sellerOnboarding: sellerOnboardingReducer,
    },
    preloadedState: {
      auth: {
        user,
        status: 'succeeded',
        error: null,
      } as AuthState,
    },
  });

  return render(
    <Provider store={store}>
      <KycComplianceContent />
    </Provider>
  );
}

describe('KycComplianceContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches bank profile and displays existing KYC document and organization contacts', async () => {
    renderWithStore();

    expect(serviceMock.getBankProfile).toHaveBeenCalledTimes(1);

    // Verify bank header
    await waitFor(() => {
      expect(screen.getByText('Awash Bank')).toBeInTheDocument();
      expect(screen.getByText('Bank status: In Review')).toBeInTheDocument();
    });

    // Verify existing KYC document card
    expect(screen.getByText('tax_cert.pdf')).toBeInTheDocument();
    expect(screen.getByText('Uploaded to backend')).toBeInTheDocument();
    expect(screen.getByText('Replace PDF')).toBeInTheDocument();

    // Verify pre-filled contact inputs and saved badge
    expect(screen.getByDisplayValue('Abebe Kebede')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+251911000001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tigist Haile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+251911000002')).toBeInTheDocument();

    expect(screen.getByText('Contacts saved')).toBeInTheDocument();
  });

  it('displays KYC complete state if bank status is Active', async () => {
    serviceMock.getBankProfile.mockResolvedValueOnce({
      data: { ...mockProfile, status: 'Active' },
    });

    renderWithStore({ bankStatus: 'Active' });

    await waitFor(() => {
      expect(screen.getByText('KYC complete')).toBeInTheDocument();
      expect(screen.getByText(/is already Active\. KYC & compliance actions are hidden/i)).toBeInTheDocument();
    });
  });

  it('shows upload dropzone and empty contacts when bank profile has no KYC yet', async () => {
    const emptyProfile: BankProfile = {
      bank_id: mockProfile.bank_id,
      bank_code: mockProfile.bank_code,
      bank_name: mockProfile.bank_name,
      entity_type: mockProfile.entity_type,
      registered_street: mockProfile.registered_street,
      registered_zone: mockProfile.registered_zone,
      registered_region: mockProfile.registered_region,
      registered_postal_code: mockProfile.registered_postal_code,
      registered_email: mockProfile.registered_email,
      registered_phone: mockProfile.registered_phone,
      status: mockProfile.status,
      kyc_document_uploaded: false,
      org_grievance_updated: false,
    };

    serviceMock.getBankProfile.mockResolvedValueOnce({
      data: emptyProfile,
    });

    renderWithStore();

    await waitFor(() => {
      expect(screen.getByText('Click to upload')).toBeInTheDocument();
    });

    expect(screen.queryByText('Contacts saved')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Abebe Kebede')).not.toBeInTheDocument();
  });
});
