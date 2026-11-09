import type { LoanApplicationSummary } from '@/features/loans/api/loan.service';
import {
  fetchLoanApplicationAPI,
  loanFormReducer,
  setFormData,
} from '@/features/new-loan/store/newLoanFormSlice';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { Step4Success } from './Step4Success';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/features/loans/components/modals/LoanApplicationModalLegacy', () => ({
  default: () => null,
}));

describe('Step4Success', () => {
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

    expect(
      screen.getByText(/has been securely transmitted to Coopay Bank\./)
    ).toBeInTheDocument();
    expect(screen.queryByText(/transmitted to Coop Bank\./)).not.toBeInTheDocument();
  });
});
