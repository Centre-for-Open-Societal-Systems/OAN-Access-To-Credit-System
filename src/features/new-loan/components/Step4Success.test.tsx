import type { LoanApplicationSummary } from '@/features/loans/api/loan.service';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchLoanApplicationAPI,
  loanFormReducer,
  setApplicationId,
  setFormData,
} from '../store/newLoanFormSlice';
import { downloadLoanApplicationPdf } from '../utils/downloadLoanApplicationPdf';
import { Step4Success } from './Step4Success';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/features/loans/components/modals/LoanApplicationModalLegacy', () => ({
  default: () => null,
}));

vi.mock('../utils/downloadLoanApplicationPdf', () => ({
  downloadLoanApplicationPdf: vi.fn(),
}));

function renderSuccess(applicationId: string | null = 'APP-2026-00107') {
  const store = configureStore({ reducer: { loanForm: loanFormReducer } });
  store.dispatch(setFormData({
    firstName: 'Test',
    lastName: 'Farmer',
    loanType: 'Agricultural Loan',
    purpose: 'Seeds and fertilizer',
    requestedAmount: '25000',
    duration: '12 months',
    mobilePhone: '+251900000000',
    region: 'Oromia',
  }));
  if (applicationId) store.dispatch(setApplicationId(applicationId));

  render(
    <Provider store={store}>
      <Step4Success />
    </Provider>
  );
}

describe('Step4Success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloads an application PDF instead of opening the print dialog', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderSuccess();

    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    expect(downloadLoanApplicationPdf).toHaveBeenCalledWith(expect.objectContaining({
      applicationId: 'APP-2026-00107',
      applicantName: 'Test Farmer',
      requestedAmount: '25000',
    }));
    expect(print).not.toHaveBeenCalled();
  });

  it('shows an actionable error when an application ID is unavailable', () => {
    renderSuccess(null);

    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));

    expect(screen.getByRole('alert')).toHaveTextContent('The application ID is missing');
    expect(downloadLoanApplicationPdf).not.toHaveBeenCalled();
  });

  it('shows the bank associated with the submitted application', () => {
    const store = configureStore({ reducer: { loanForm: loanFormReducer } });
    const application = {
      application_id: 'APP-1',
      bank: 'PB-0085',
      status: 'Active',
      creation: '2026-11-04',
      is_terminal: false,
      is_successful: false,
      lenderName: 'Coopay Bank',
    } as LoanApplicationSummary & { lenderName: string };

    store.dispatch(fetchLoanApplicationAPI.fulfilled(application, 'request-1', 'LD-0001'));
    store.dispatch(setFormData({ firstName: 'Abebe', lastName: 'Kebede' }));

    render(
      <Provider store={store}>
        <Step4Success />
      </Provider>
    );

    expect(screen.getByText(/has been securely transmitted to Coopay Bank\./)).toBeInTheDocument();
    expect(screen.queryByText(/transmitted to Coop Bank\./)).not.toBeInTheDocument();
  });
});
