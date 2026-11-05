import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loanFormReducer, setApplicationId, setFormData } from '../store/newLoanFormSlice';
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
});
