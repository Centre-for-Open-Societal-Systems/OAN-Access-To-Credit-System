import { loanService, type LoanApplicationSummary } from '@/features/loans/api/loan.service';
import { getCatalogBank } from '@/lib/api/catalogApi';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchLoanApplicationAPI, loanFormReducer } from './newLoanFormSlice';

vi.mock('@/features/loans/api/loan.service', () => ({
  loanService: { findApplicationByLeadId: vi.fn() },
}));

vi.mock('@/lib/api/catalogApi', () => ({
  getCatalogBank: vi.fn(),
}));

describe('loan application bank name', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stores the associated bank brand name for the success message', async () => {
    vi.mocked(loanService.findApplicationByLeadId).mockResolvedValue({
      application_id: 'APP-1',
      bank: 'PB-0085',
      status: 'Active',
      creation: '2026-11-04',
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
  });
});
