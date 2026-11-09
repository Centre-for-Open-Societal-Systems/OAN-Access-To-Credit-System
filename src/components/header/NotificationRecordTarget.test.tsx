import { loanService } from '@/features/loans/api/loan.service';
import { loanProductsService } from '@/features/seller/api/loan-products.service';
import { taxonomyService } from '@/features/seller/api/taxonomy.service';
import { sellerProductsReducer } from '@/features/seller/store/loanProductsSlice';
import { loanApplicationFullSchema, loanProductDetailSchema } from '@/lib/api/api.schemas';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationRecordTarget } from './NotificationRecordTarget';

const navigation = vi.hoisted(() => ({ query: '', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
  usePathname: () => '/application-lists',
  useRouter: () => ({ replace: navigation.replace }),
}));
vi.mock('@/features/loans/api/loan.service', () => ({ loanService: { getFullProfile: vi.fn() } }));
vi.mock('@/features/seller/api/loan-products.service', () => ({ loanProductsService: { getProduct: vi.fn() } }));
vi.mock('@/features/seller/api/taxonomy.service', () => ({
  taxonomyService: { getCategories: vi.fn(), getTags: vi.fn(), getAttributes: vi.fn() },
}));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

function showTarget(type: 'product' | 'application') {
  const store = configureStore({ reducer: { sellerProducts: sellerProductsReducer } });
  return render(<Provider store={store}><NotificationRecordTarget type={type} /></Provider>);
}

describe('notification record destinations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    navigation.query = '';
    vi.mocked(taxonomyService.getCategories).mockResolvedValue({ status: 'success', message: 'Loaded', data: [] });
    vi.mocked(taxonomyService.getTags).mockResolvedValue({ status: 'success', message: 'Loaded', data: [] });
    vi.mocked(taxonomyService.getAttributes).mockResolvedValue({ status: 'success', message: 'Loaded', data: [] });
  });

  it('loads a referenced application without needing a row on the loaded page', async () => {
    navigation.query = 'application=APP-200&tab=all';
    vi.mocked(loanService.getFullProfile).mockResolvedValue({ status: 'success', message: 'Loaded', data: loanApplicationFullSchema.parse({
      application_id: 'APP-200', status: 'Pending Review', first_name: 'Abebe', last_name: 'Kebede',
      loan_product_name: 'Harvest Loan', creation: '2026-10-28T09:00:00Z',
    }) });
    showTarget('application');
    // The modal is a lazy-loaded chunk; the full suite can take longer than
    // Testing Library's one-second default to load it on a busy worker.
    expect(await screen.findByText('Abebe Kebede', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('Harvest Loan')).toBeInTheDocument();
    expect(loanService.getFullProfile).toHaveBeenCalledWith('APP-200', { signal: expect.any(AbortSignal) });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(navigation.replace).toHaveBeenCalledWith('/application-lists?tab=all', { scroll: false });
  });

  it('shows a record-load error instead of a blank application', async () => {
    navigation.query = 'application=APP-DELETED';
    vi.mocked(loanService.getFullProfile).mockRejectedValue(new Error('Application not found'));
    showTarget('application');
    expect(await screen.findByRole('alert')).toHaveTextContent('Application not found');
    expect(screen.queryByText('Farmer Information')).not.toBeInTheDocument();
  });

  it('loads a product by ID even when the catalog has no loaded products', async () => {
    navigation.query = 'product=PRODUCT-200';
    vi.mocked(loanProductsService.getProduct).mockResolvedValue({ status: 'success', message: 'Loaded', data: loanProductDetailSchema.parse({
      name: 'PRODUCT-200', product_name: 'Archived Harvest Loan', status: 'Archived',
      min_interest_rate: 5, max_amount: 10000, tenure_months: 12,
    }) });
    showTarget('product');
    expect(await screen.findByDisplayValue('Archived Harvest Loan', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(loanProductsService.getProduct).toHaveBeenCalledWith('PRODUCT-200');
    expect(screen.queryByRole('button', { name: 'Approve...' })).not.toBeInTheDocument();
  });

  it('shows product lookup failures and leaves the dialog closable', async () => {
    navigation.query = 'product=PRODUCT-DELETED';
    vi.mocked(loanProductsService.getProduct).mockRejectedValue(new Error('Product not found'));
    showTarget('product');
    expect(await screen.findByText('Product not found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  });

  it('does not load a record when no reference is present', async () => {
    showTarget('application');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(loanService.getFullProfile).not.toHaveBeenCalled();
    expect(loanProductsService.getProduct).not.toHaveBeenCalled();
  });
});
