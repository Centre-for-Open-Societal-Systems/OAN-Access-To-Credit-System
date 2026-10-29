import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogProduct } from '@/types/loan-catalog';
import DiscoverLoansClient, { applyHrefFor } from './DiscoverLoansClient';

const product = { name: 'PROD-1', product_name: 'Seed Loan' } as CatalogProduct;

vi.mock('@/components/loan-catalog/CatalogBrowser', () => ({
  default: ({
    renderCard,
  }: {
    renderCard: (p: CatalogProduct, c: Record<string, never>) => ReactNode;
  }) => <div>{renderCard(product, {})}</div>,
}));
vi.mock('@/components/loan-catalog/CatalogCard', () => ({
  default: ({ actions }: { actions: ReactNode }) => <div>{actions}</div>,
}));
vi.mock('../../api/farmerApi', () => ({
  getCatalog: vi.fn(),
  saveBookmark: vi.fn(),
  removeBookmark: vi.fn(),
}));

describe('applyHrefFor', () => {
  it('sends a farmer to the apply flow for the product', () => {
    expect(applyHrefFor('farmer', product)).toBe('/discover-loans/apply/PROD-1');
  });

  it('sends a development agent to the Leads dashboard, not the farmer-only route', () => {
    expect(applyHrefFor('development-agent', product)).toBe('/leads');
  });
});

describe('DiscoverLoansClient Apply Now', () => {
  it('links a farmer to the apply route by default', () => {
    render(<DiscoverLoansClient />);
    expect(screen.getByRole('link', { name: /apply now/i })).toHaveAttribute(
      'href',
      '/discover-loans/apply/PROD-1'
    );
  });

  it('links a development agent to the Leads dashboard', () => {
    render(<DiscoverLoansClient portal="development-agent" />);
    expect(screen.getByRole('link', { name: /apply now/i })).toHaveAttribute('href', '/leads');
  });
});
