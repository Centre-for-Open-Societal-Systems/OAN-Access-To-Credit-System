import { configure, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FarmerLoanApplication } from '../../types';
import ApplicationActionModal from './ApplicationActionModal';

configure({ asyncUtilTimeout: 5000 });

const { getApplication, getBankDetails } = vi.hoisted(() => ({
  getApplication: vi.fn(),
  getBankDetails: vi.fn(),
}));

vi.mock('../../api/farmerApi', () => ({
  getApplication,
  getBankDetails,
  submitApplication: vi.fn(),
}));

const application = {
  application_id: 'APP-2026-00211',
  status: 'Submitted',
  stage_id: 'STAGE-1',
  bank: 'PB-0035',
  requested_amount: 100000,
  loan_reason: 'Seeds',
  creation: '2026-10-15T21:27:40.373371',
} as FarmerLoanApplication;

function renderModal() {
  render(
    <ApplicationActionModal
      isOpen
      onClose={() => {}}
      applicationId="APP-2026-00211"
      application={application}
      title="dashen farmer loan"
      subtitle="Created on Oct 15, 2026"
      maxAmount="ETB 100,000"
      interest="3% - 5%"
      tenure="3 mo"
      repayment="—"
      modalTitle="Track Application"
    />
  );
}

describe('ApplicationActionModal — Application Info', () => {
  beforeEach(() => {
    getApplication.mockReset().mockResolvedValue({ data: application });
    getBankDetails.mockReset();
  });

  it("shows the bank's name instead of its ID", async () => {
    getBankDetails.mockResolvedValue({ data: { bank_name: 'Dashen Bank Demo', brand_name: null } });
    renderModal();

    expect(await screen.findByText('Dashen Bank Demo')).toBeInTheDocument();
    expect(getBankDetails).toHaveBeenCalledWith('PB-0035');
    expect(screen.queryByText('PB-0035')).not.toBeInTheDocument();
  });

  it('prefers the brand name when the bank has one', async () => {
    getBankDetails.mockResolvedValue({ data: { bank_name: 'Dashen Bank Demo', brand_name: 'Dashen' } });
    renderModal();

    expect(await screen.findByText('Dashen')).toBeInTheDocument();
  });

  it('falls back to the bank ID when the lookup fails', async () => {
    getBankDetails.mockRejectedValue(new Error('Bank not found'));
    renderModal();

    expect(await screen.findByText('PB-0035')).toBeInTheDocument();
    await waitFor(() => expect(getBankDetails).toHaveBeenCalled());
  });

  it('shows Created On as a readable date and time, not the raw ISO string', async () => {
    getBankDetails.mockResolvedValue({ data: { bank_name: 'Dashen Bank Demo' } });
    renderModal();

    expect(await screen.findByText('Oct 15, 2026, 9:27 PM')).toBeInTheDocument();
    expect(screen.queryByText(/373371/)).not.toBeInTheDocument();
  });
});
