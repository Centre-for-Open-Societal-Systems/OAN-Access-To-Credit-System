import { changePassword, getUserProfile, updateProfile, type UserProfileResponse } from '@/features/auth/api/authApi';
import { authReducer } from '@/features/auth/store/authSlice';
import type { User } from '@/features/auth/types/auth.types';
import { toast } from '@/lib/toast';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileModal } from './ProfileModal';

vi.mock('@/features/auth/api/authApi', () => ({
  getUserProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock('@/features/seller/api/onboarding.service', () => ({
  onboardingService: { uploadImage: vi.fn() },
}));

vi.mock('@/lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const EMAIL = 'abebe@oan.test';
const NAME = 'Abebe Bekele';

const PROFILE: UserProfileResponse = {
  personal_information: {
    user_image: null,
    full_name: NAME,
    email_address: EMAIL,
    gender: 'Male',
    phone_number: '+251911000000',
    language: 'Amharic',
  },
  account_information: {
    user_role: 'Farmer',
    organization: 'OpenAgriNet',
    employee_id: 'N/A',
    member_since: '2026-01-01',
  },
};

const FARMER: User = { kind: 'farmer', email: EMAIL, name: NAME };

/** Every role whose profile is still its own to edit. */
const EDITABLE_USERS: readonly User[] = [
  {
    kind: 'bank_admin',
    email: EMAIL,
    name: NAME,
    bankId: 'BANK-1',
    bankCode: 'B1',
    bankName: 'Bank One',
    bankStatus: 'Active',
  },
  {
    kind: 'bank_agent',
    email: EMAIL,
    name: NAME,
    bankId: 'BANK-1',
    bankCode: 'B1',
    bankName: 'Bank One',
    bankStatus: 'Active',
  },
  { kind: 'dev_agent', email: EMAIL, name: NAME },
  { kind: 'marketplace', email: EMAIL, name: NAME },
];

function renderModal(user: User) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user, status: 'succeeded' as const, error: null } },
  });

  render(
    <Provider store={store}>
      <ProfileModal isOpen onClose={() => {}} />
    </Provider>
  );
}

/** The modal loads its profile on open; every assertion needs that to have landed. */
const loaded = () => waitFor(() => expect(screen.getByLabelText(/full name/i)).toBeInTheDocument());

describe("ProfileModal — a farmer's details belong to the registry", () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockReset().mockResolvedValue(PROFILE);
    vi.mocked(updateProfile).mockReset();
  });

  it('locks every personal field', async () => {
    // Farmer details are sourced from the farmer registry. An edit here would
    // either be overwritten by the next sync or survive it, leaving A2C and the
    // registry disagreeing about who someone is.
    renderModal(FARMER);
    await loaded();

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/gender/i)).toBeDisabled();
    expect(screen.getByLabelText(/phone number/i)).toBeDisabled();
    expect(screen.getByLabelText(/language/i)).toBeDisabled();
  });

  it('still shows what the registry holds', async () => {
    renderModal(FARMER);
    await loaded();

    expect(screen.getByLabelText(/full name/i)).toHaveValue(NAME);
    expect(screen.getByLabelText(/gender/i)).toHaveValue('Male');
    expect(screen.getByLabelText(/language/i)).toHaveValue('Amharic');
  });

  it('offers no Save button at all', async () => {
    // A disabled one would still assert "there is a change to save here", which
    // is the claim being withdrawn.
    renderModal(FARMER);
    await loaded();

    expect(screen.queryByRole('button', { name: /save change/i })).not.toBeInTheDocument();
  });

  it('offers no photo upload', async () => {
    renderModal(FARMER);
    await loaded();

    expect(screen.queryByRole('button', { name: /upload new photo/i })).not.toBeInTheDocument();
  });

  it('says where the details come from', async () => {
    renderModal(FARMER);
    await loaded();

    expect(screen.getByText(/come from the farmer registry/i)).toBeInTheDocument();
  });

  it("keeps the password editable, which is A2C's own credential", async () => {
    renderModal(FARMER);
    await loaded();

    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('renders no required markers on fields nobody can supply', async () => {
    renderModal(FARMER);
    await loaded();

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});

describe('ProfileModal — every other role still edits its own profile', () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockReset().mockResolvedValue(PROFILE);
    vi.mocked(updateProfile).mockReset();
  });

  it.each(EDITABLE_USERS.map((user) => [user.kind, user] as const))(
    'leaves the personal fields editable for %s',
    async (_kind, user) => {
      renderModal(user);
      await loaded();

      expect(screen.getByLabelText(/full name/i)).toBeEnabled();
      expect(screen.getByRole('button', { name: /save change/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload new photo/i })).toBeInTheDocument();
    }
  );
});

describe('ProfileModal — password update', () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockReset().mockResolvedValue(PROFILE);
    vi.mocked(changePassword).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it('rejects reusing the current password without calling the API', async () => {
    renderModal(FARMER);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    fireEvent.change(screen.getByPlaceholderText('••••••••••••'), {
      target: { value: 'CurrentPassword1!' },
    });
    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: 'CurrentPassword1!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
      target: { value: 'CurrentPassword1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(toast.error).toHaveBeenCalledWith('New password must be different from the current password');
    expect(changePassword).not.toHaveBeenCalled();
  });
});
