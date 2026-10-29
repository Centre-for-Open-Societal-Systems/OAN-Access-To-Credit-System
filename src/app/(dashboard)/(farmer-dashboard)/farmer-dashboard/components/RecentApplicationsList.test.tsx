import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecentApplicationsList from './RecentApplicationsList';

const { getBankDetails, warn } = vi.hoisted(() => ({ getBankDetails: vi.fn(), warn: vi.fn() }));

vi.mock('@/features/(farmer-application)/api/farmerApi', () => ({ getBankDetails }));
vi.mock('@/lib/logger', () => ({ logger: { warn } }));

const app = (id: string, bank: string) => ({
  application_id: id,
  bank,
  loan_product_name: 'Lersahawo',
  requested_amount: 10000,
  status: 'Submitted',
  creation: '2026-10-22T06:29:26.026643+03:00',
});

describe('RecentApplicationsList', () => {
  beforeEach(() => {
    getBankDetails.mockReset();
    warn.mockReset();
  });

  it("shows the bank's name instead of its ID", async () => {
    getBankDetails.mockResolvedValue({ data: { bank_name: 'Amhara Bank' } });
    render(<RecentApplicationsList applications={[app('APP-1', 'PB-0001')]} />);

    expect(await screen.findByText('Amhara Bank')).toBeInTheDocument();
    expect(screen.queryByText('PB-0001')).not.toBeInTheDocument();
  });

  it('looks each bank up once however many applications share it', async () => {
    getBankDetails.mockResolvedValue({ data: { bank_name: 'Amhara Bank' } });
    render(
      <RecentApplicationsList applications={[app('APP-1', 'PB-0001'), app('APP-2', 'PB-0001')]} />
    );

    expect(await screen.findAllByText('Amhara Bank')).toHaveLength(2);
    expect(getBankDetails).toHaveBeenCalledTimes(1);
  });

  it('keeps the ID when the lookup fails', async () => {
    getBankDetails.mockRejectedValue(new Error('Bank not found'));
    render(<RecentApplicationsList applications={[app('APP-1', 'PB-0001')]} />);

    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(screen.getByText('PB-0001')).toBeInTheDocument();
  });
});
