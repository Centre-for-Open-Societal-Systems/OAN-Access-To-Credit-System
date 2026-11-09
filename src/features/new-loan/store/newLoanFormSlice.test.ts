import { loanService, type LoanApplicationSummary } from '@/features/loans/api/loan.service';
import { getCatalogBank } from '@/lib/api/catalogApi';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchLoanApplicationAPI, loanFormReducer, submitApplicationAPI } from './newLoanFormSlice';

vi.mock('@/features/loans/api/loan.service', () => ({
  loanService: { findApplicationByLeadId: vi.fn(), submitApplication: vi.fn() },
}));

vi.mock('@/lib/api/catalogApi', () => ({
  getCatalogBank: vi.fn(),
}));

describe('persisted loan application context', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores the associated bank brand name for the success message', async () => {
    vi.mocked(loanService.findApplicationByLeadId).mockResolvedValue({
      application_id: 'APP-1',
      bank: 'PB-0085',
      status: 'Active',
      creation: '2026-11-04',
      submitted_at: '2026-11-04T10:15:00+03:00',
      is_terminal: false,
      is_successful: false,
    } as LoanApplicationSummary);
    vi.mocked(getCatalogBank).mockResolvedValue({
      data: {
        bank: 'PB-0085',
        bank_name: 'Cooperative Bank of Oromia',
        brand_name: 'Coopay Bank',
      },
    });

    const store = configureStore({ reducer: { loanForm: loanFormReducer } });
    await store.dispatch(fetchLoanApplicationAPI('LD-0001') as never);

    expect(getCatalogBank).toHaveBeenCalledWith('PB-0085');
    expect(store.getState().loanForm.lenderName).toBe('Coopay Bank');
    expect(store.getState().loanForm.submittedAt).toBe('2026-11-04T10:15:00+03:00');
  });

  it('stores the authoritative timestamp returned when submission succeeds', async () => {
    vi.mocked(loanService.submitApplication).mockResolvedValue({
      status: 'success',
      message: 'Application submitted successfully',
      data: { submitted_at: '2026-11-09T08:42:00+03:00' },
    });

    const store = configureStore({ reducer: { loanForm: loanFormReducer } });
    await store.dispatch(submitApplicationAPI('APP-1') as never);

    expect(store.getState().loanForm.submittedAt).toBe('2026-11-09T08:42:00+03:00');
  });
});
