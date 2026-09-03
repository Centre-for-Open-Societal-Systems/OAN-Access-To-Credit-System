'use client';

import CatalogCard from '@/components/loan-catalog/CatalogCard';
import { getLoanProductStatusPresentation } from '@/features/seller/constants/loan-product-status';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import type { CatalogProduct } from '@/types/loan-catalog';
import { CalendarDays, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ReviewProductModal } from '../product-approvals/ReviewProductModal';
import { DeleteLoanProductModal } from './DeleteLoanProductModal';
import { EditLoanProductModal } from './EditLoanProductModal';

function formatCurrencyRange(minAmount: number | null | undefined, maxAmount: number): string {
  const min = minAmount === null || minAmount === undefined ? '0' : minAmount.toLocaleString('en-US');
  const max = maxAmount.toLocaleString('en-US');
  return `ETB ${min}–${max}`;
}

function formatCreationDate(value: string | null | undefined): string {
  if (!value) return 'Created date unavailable';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Adapts a `list_products` row to the catalog card's shape.
 *
 * The two endpoints describe the same product with different nullability —
 * `list_products` sends JSON null for anything the bank left unset, where the
 * catalog simply omits the key. Optional fields are therefore spread in only
 * when they carry a value, which is also what `exactOptionalPropertyTypes`
 * requires.
 */
function toCatalogProduct(product: LoanProductSummary): CatalogProduct {
  return {
    name: product.name,
    product_name: product.product_name,
    // `slug` is only ever read for display fallbacks; the record name is the
    // stable identifier when a product predates the slug field.
    slug: product.slug ?? product.name,
    bank: product.bank ?? '',
    status: product.status,
    min_interest_rate: product.min_interest_rate,
    max_amount: product.max_amount,
    tenure_months: product.tenure_months,
    categories: product.categories,
    applications_count: product.applications_count,
    image: product.image ?? null,
    ...(product.bank_name ? { bank_name: product.bank_name } : {}),
    ...(product.max_interest_rate != null ? { max_interest_rate: product.max_interest_rate } : {}),
    ...(product.min_amount != null ? { min_amount: product.min_amount } : {}),
  };
}

export interface LoanProductCardProps {
  product: LoanProductSummary;
  variant?: 'default' | 'approval';
  canDelete?: boolean;
}

/**
 * Whether this product's terms may still be changed.
 *
 * Not a role check — agents author products too. What the status forbids it
 * forbids for everyone: a live or in-review product would otherwise have its
 * terms changed underneath farmers already applying, or underneath the admin's
 * own approval queue.
 *
 * Archived counts as forbidden. It is a retired product, not a draft: it accepts
 * no new applications, and rewriting the terms of a loan that has already been
 * taken off the marketplace changes the record of what was once offered. This
 * used to return true, which was harmless only for as long as archived products
 * never appeared in a list — the bank catalog now shows them, so the Edit button
 * would have been real.
 */
export function canEditLoanProduct(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s !== 'active' && s !== 'pending approval' && s !== 'archived';
}

/**
 * A loan product as the owning bank sees it.
 *
 * Same shell as the farmer's Discover Loans card (`@/components/loan-catalog/CatalogCard`)
 * — these were two different components for one product and had drifted in
 * wording, spacing and colour. What the bank gets instead of Apply is a status
 * pill and one of Edit or View, decided by whether this viewer may still change
 * the product: a live or in-review product is read-only for everyone, and only a
 * bank admin (`canDelete`) may archive.
 */
export function LoanProductCard({ product, variant = 'default', canDelete = true }: LoanProductCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const canEdit = canEditLoanProduct(product.status);
  const isApproval = variant === 'approval';
  const status = getLoanProductStatusPresentation(product.status);

  const applicantsCount = product.applications_count ?? 0;
  const catalogProduct = toCatalogProduct(product);

  return (
    <>
      <CatalogCard
        product={catalogProduct}
        showRateRange
        badge={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm ${status.badgeClasses}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dotClasses}`} />
            {status.label}
          </span>
        }
        meta={
          // The bank's own operational detail, which the farmer card has no use
          // for: the full lending span (the terms strip below shows only the
          // ceiling, as it does for farmers) plus reach or provenance.
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-gray-500">
            <span className="font-semibold text-gray-700">
              {formatCurrencyRange(product.min_amount, product.max_amount)}
            </span>
            {isApproval ? (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} />
                  Created {formatCreationDate(product.creation)}
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>ID: {product.name}</span>
              </>
            ) : (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-bold text-gray-900">{applicantsCount} applicants</span>
              </>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {isApproval ? (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className='font-semibold'>Review</span>
                </button>
              ) : canEdit ? (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label={`Edit ${product.product_name}`}
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-2.5 px-3.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className='font-semibold'><Pencil className="w-4 h-4" /> Edit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(true)}
                  aria-label={`View ${product.product_name}`}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
              )}
            </div>
            {!isApproval && canDelete ? (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 active:scale-95"
                aria-label={`Archive ${product.product_name}`}
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
        }
      />

      {isEditModalOpen && <EditLoanProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={product} />}
      {isDeleteModalOpen && <DeleteLoanProductModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} product={product} />}
      {!isApproval && isViewModalOpen && (
        <ReviewProductModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} product={product} readOnlyView={true} />
      )}
      {isApproval && isReviewModalOpen && (
        <ReviewProductModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} product={product} initialMode={null} />
      )}
    </>
  );
}
