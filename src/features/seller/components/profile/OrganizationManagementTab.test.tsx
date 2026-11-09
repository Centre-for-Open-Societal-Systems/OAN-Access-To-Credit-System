import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrganizationManagementTab from './OrganizationManagementTab';

const { getBankProfile, updateBankProfile } = vi.hoisted(() => ({
  getBankProfile: vi.fn(),
  updateBankProfile: vi.fn(),
}));

vi.mock('@/features/seller/api/onboarding.service', () => ({
  onboardingService: { getBankProfile, updateBankProfile, uploadImage: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const profile = {
  bank_name: 'Demo Bank',
  bank_code: '1234567890',
  registered_street: 'Bole Road',
  registered_zone: 'Zone 1',
  registered_region: 'Addis Ababa',
  registered_postal_code: '1000',
  entity_type: 'Bank',
  registered_email: 'info@demo.bank',
  registered_phone: '251911000000',
};

const renderTab = async () => {
  render(<OrganizationManagementTab />);
  return screen.findByPlaceholderText('REG-ET-20231042');
};

describe('OrganizationManagementTab registration number', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBankProfile.mockResolvedValue({ data: { ...profile } });
    updateBankProfile.mockResolvedValue({ data: { message: 'ok' } });
  });

  it('sends an edited registration number in the save payload', async () => {
    const input = await renderTab();
    fireEvent.change(input, { target: { value: '9876543210' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Save Change/ })[0]!);

    await waitFor(() => expect(updateBankProfile).toHaveBeenCalledTimes(1));
    expect(updateBankProfile.mock.calls[0]?.[0]).toMatchObject({ bank_code: '9876543210' });
  });

  it('leaves the registration number out of the payload when it was not edited', async () => {
    await renderTab();
    fireEvent.click(screen.getAllByRole('button', { name: /Save Change/ })[0]!);

    await waitFor(() => expect(updateBankProfile).toHaveBeenCalledTimes(1));
    expect(updateBankProfile.mock.calls[0]?.[0]).not.toHaveProperty('bank_code');
  });

  it('rejects an edited registration number outside 9-10 characters without saving', async () => {
    const input = await renderTab();
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Save Change/ })[0]!);

    await waitFor(() => expect(screen.getAllByRole('button', { name: /Save Change/ })[0]).toBeEnabled());
    expect(updateBankProfile).not.toHaveBeenCalled();
  });
});
