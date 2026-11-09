'use client';

import { NotificationRecordTarget } from '@/components/header/NotificationRecordTarget';
import CatalogBrowser from '@/components/loan-catalog/CatalogBrowser';
import { LOAN_PRODUCT_STATUS_PRESENTATION } from '@/features/seller/constants/loan-product-status';
import { selectCatalogVersion } from '@/features/seller/store/loanProductsSlice';
import { getCatalog } from '@/lib/api/catalogApi';
import { useAppSelector } from '@/store/hooks';
import type { CatalogProduct, CatalogStatusOption } from '@/types/loan-catalog';
import { useCallback } from 'react';
import { BankCatalogCard } from './BankCatalogCard';
import { BankHeaderCard } from './BankHeaderCard';

interface BankProductCatalogProps {
  portalLabel?: string;
}

/**
 * Every A2C Loan Product status, in the bank's own words.
 *
 * Derived from the badge presentation rather than listed again, so a chip and
 * the badge on the card it filters to can never disagree about what a status is
 * called — Active reads as "Approved" in both.
 */
const STATUS_OPTIONS: ReadonlyArray<CatalogStatusOption> = Object.entries(
  LOAN_PRODUCT_STATUS_PRESENTATION
).map(([value, presentation]) => ({ value, label: presentation.label }));

/**
 * The bank's own loan products, in the same catalog view farmers browse.
 *
 * Same endpoint as `/discover-loans`, scoped server-side to the caller's bank
 * and widened to every status — so what the bank sees here is what it publishes,
 * laid out the way a farmer will meet it.
 *
 * Archived products are reachable through the Status filter. `list_catalog`
 * leaves them out of a bank's default page and takes a single status, so
 * "Archived" is a chip rather than a tick-box bolted onto the default list;
 * showing them inline alongside live products would take a change to that
 * endpoint. What matters is that they stopped being invisible: a bank that
 * archived a product previously had no way, anywhere in the portal, to tell it
 * apart from one that had been deleted.
 *
 * The add/edit/archive modals write through `loanProductsSlice`, which refetches
 * the *seller* product list — a different endpoint that this page does not read.
 * `catalogVersion` is what carries a mutation across that gap: the slice bumps it
 * once per mutation, and the browser refetches when it moves.
 */
export function BankProductCatalog({ portalLabel }: BankProductCatalogProps) {
  const catalogVersion = useAppSelector(selectCatalogVersion);

  const renderCard = useCallback(
    (product: CatalogProduct) => <BankCatalogCard key={product.name} product={product} />,
    []
  );

  return (
    <>
      <NotificationRecordTarget type="product" />
      <CatalogBrowser
        fetchProducts={getCatalog}
        renderCard={renderCard}
        refreshToken={catalogVersion}
        statusOptions={STATUS_OPTIONS}
        header={<BankHeaderCard portalLabel={portalLabel} />}
        emptyTitle="No loan products found"
        emptySubtitle="Create a loan product to publish it to the marketplace."
      />
    </>
  );
}
