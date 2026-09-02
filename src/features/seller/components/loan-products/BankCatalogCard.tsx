'use client';

import CatalogCard from '@/components/loan-catalog/CatalogCard';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectUserKind } from '@/features/auth/store/authSlice';
import { getLoanProductStatusPresentation } from '@/features/seller/constants/loan-product-status';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { useAppSelector } from '@/store/hooks';
import { resolveCategory, type CatalogProduct } from '@/types/loan-catalog';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ReviewProductModal } from '../product-approvals/ReviewProductModal';
import { DeleteLoanProductModal } from './DeleteLoanProductModal';
import { EditLoanProductModal } from './EditLoanProductModal';
import { canEditLoanProduct } from './LoanProductCard';

/**
 * The catalog sends a product's status as a plain string; the modals type theirs
 * as the `LoanProductSummary` enum. Anything unrecognised is carried across as
 * 'Pending Approval' — the one value that grants no capability, so an unknown
 * status can never be mistaken for a live or an editable product.
 */
const KNOWN_STATUSES: ReadonlyArray<LoanProductSummary['status']> = [
  'Active',
  'Archived',
  'Pending Approval',
  'Rejected',
];

/**
 * Adapts a catalog product to the shape the product modals expect.
 *
 * They read very little of it — `EditLoanProductModal` takes `name` and
 * `status`, `DeleteLoanProductModal` takes `name`, and `ReviewProductModal`
 * fetches its own detail from `name` — so the fields the catalog does not send
 * are filled with neutral defaults rather than being invented.
 */
function toProductSummary(product: CatalogProduct): LoanProductSummary {
  const status = KNOWN_STATUSES.find((known) => known === product.status) ?? 'Pending Approval';
  const category = resolveCategory(product);

  return {
    name: product.name,
    product_name: product.product_name,
    slug: product.slug,
    status,
    min_interest_rate: product.min_interest_rate ?? 0,
    max_interest_rate: product.max_interest_rate ?? null,
    min_amount: product.min_amount ?? null,
    max_amount: product.max_amount ?? 0,
    tenure_months: product.tenure_months ?? 0,
    creation: null,
    categories: category ? [category] : [],
    applications_count: product.applications_count ?? 0,
  };
}

interface BankCatalogCardProps {
  product: CatalogProduct;
}

export function BankCatalogCard({ product }: BankCatalogCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const userKind = useAppSelector(selectUserKind);
  // Archiving is the admin's call alone. The absence of a role (a session still
  // restoring) resolves to "not an admin" rather than briefly offering a button
  // that would 403.
  const isBankAdmin = userKind === 'bank_admin';
  // Editing is gated on the status, not the role. Agents author products too —
  // that is what the Add button in the header is for — so an agent must be able
  // to fix a Rejected one and resubmit it; the rejection comment is shown in the
  // modal for exactly that. What the status forbids it forbids for everyone: a
  // live or in-review product would otherwise have its terms changed underneath
  // farmers already applying, or underneath the admin's own approval queue.
  const canEdit = canEditLoanProduct(product.status);
  // Archiving an archived product is a no-op the backend answers with "Product is
  // already Archived". Now that these are listed, the button would be offering
  // an action with nothing behind it.
  const isArchived = product.status === 'Archived';

  const status = getLoanProductStatusPresentation(product.status);
  const summary = toProductSummary(product);
  const applicantsCount = product.applications_count ?? 0;

  const iconButton = 'flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95';

  return (
    <>
      <CatalogCard
        product={product}
        badge={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold ${status.badgeClasses}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dotClasses}`} />
            {status.label}
          </span>
        }
        meta={`${applicantsCount} ${applicantsCount === 1 ? 'applicant' : 'applicants'}`}
        actions={
          <div className="flex items-center justify-end gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className={`${iconButton} bg-blue-50 text-blue-500 hover:bg-blue-100`}
                aria-label={`Edit ${product.product_name}`}
              >
                <Pencil size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsViewModalOpen(true)}
                className={`${iconButton} bg-gray-100 text-gray-600 hover:bg-gray-200`}
                aria-label={`View ${product.product_name}`}
              >
                <Eye size={15} />
              </button>
            )}
            {isBankAdmin && !isArchived && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className={`${iconButton} bg-red-50 text-red-500 hover:bg-red-100`}
                aria-label={`Archive ${product.product_name}`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        }
      />

      {isEditModalOpen && (
        <EditLoanProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={summary}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteLoanProductModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          product={summary}
        />
      )}
      {isViewModalOpen && (
        <ReviewProductModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={summary}
          readOnlyView={true}
        />
      )}
    </>
  );
}
