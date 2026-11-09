'use client';
import {
  clearMutationError,
  clearSelectedProductDetail,
  fetchProductDetail,
  fetchTaxonomy,
  selectAttributes,
  selectCategories,
  selectDetailError,
  selectDetailStatus,
  selectProductsMutationError,
  selectProductsMutationStatus,
  selectSelectedProductDetail,
  selectTags,
  setProductStatus,
} from '@/features/seller/store/loanProductsSlice';
import { filterEligibilityAttributes, mapTermOptions } from '@/features/seller/utils/loan-product-form.utils';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BaseLoanProductModal } from '../loan-products/BaseLoanProductModal';

interface ReviewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LoanProductSummary | Pick<LoanProductSummary, 'name'> | null;
  initialMode?: 'approve' | 'reject' | null;
  readOnlyView?: boolean;
}

export function ReviewProductModal({ isOpen, onClose, product, initialMode = null, readOnlyView = false }: ReviewProductModalProps) {
  const dispatch = useAppDispatch();
  const mutationStatus = useAppSelector(selectProductsMutationStatus);
  const mutationError = useAppSelector(selectProductsMutationError);
  const detailError = useAppSelector(selectDetailError);
  const detailStatus = useAppSelector(selectDetailStatus);
  const selectedDetail = useAppSelector(selectSelectedProductDetail);
  const productDetail = selectedDetail?.name === product?.name ? selectedDetail : null;
  const fetchedCategories = useAppSelector(selectCategories);
  const fetchedTags = useAppSelector(selectTags);
  const fetchedAttributes = useAppSelector(selectAttributes);

  const [actionMode, setActionMode] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The form belongs to one opening of the dialog, so it is re-seeded whenever
  // what the dialog is showing changes. Adjusting state during render is React's
  // documented answer to "reset state when a prop changes"; doing it inside the
  // effect below rendered the previous reason/mode once before correcting it.
  const [shownFor, setShownFor] = useState({ isOpen, product, initialMode });
  if (
    shownFor.isOpen !== isOpen ||
    shownFor.product !== product ||
    shownFor.initialMode !== initialMode
  ) {
    setShownFor({ isOpen, product, initialMode });
    if (isOpen) {
      setActionMode(initialMode === 'reject' ? 'reject' : initialMode === 'approve' ? 'approve' : null);
      setReason('');
    }
  }

  useEffect(() => {
    if (isOpen) {
      dispatch(clearMutationError());
      dispatch(fetchTaxonomy());
      if (product) {
        dispatch(fetchProductDetail(product.name));
      }
    } else {
      dispatch(clearSelectedProductDetail());
    }
  }, [dispatch, isOpen, product, initialMode]);

  const handleApprove = async () => {
    if (!product || !reason.trim()) return;
    const result = await dispatch(
      setProductStatus({
        productId: product.name,
        status: 'Active',
        reason: reason.trim(),
        refetchParams: { status: 'Pending Approval' },
      })
    );
    if (setProductStatus.fulfilled.match(result)) {
      onClose();
    }
  };

  const handleReject = async () => {
    if (!product || !reason.trim()) return;
    const result = await dispatch(
      setProductStatus({
        productId: product.name,
        status: 'Rejected',
        reason: reason.trim(),
        refetchParams: { status: 'Pending Approval' },
      })
    );
    if (setProductStatus.fulfilled.match(result)) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const isMutating = mutationStatus === 'loading';

  const summary = 'product_name' in product ? product : null;
  const isLoadingDetail = !summary && !productDetail && detailStatus !== 'failed';

  const categoryOptions = mapTermOptions(fetchedCategories);
  const tagOptions = mapTermOptions(fetchedTags);
  const realAttributes = filterEligibilityAttributes(fetchedAttributes);

  // Show summary data only until the detail response arrives; once it does, trust
  // the detail verbatim. A per-field `?? summary` fallback would make a value the
  // seller legitimately cleared (e.g. min amount) silently show the stale summary
  // number instead of empty — which an approver could then act on.
  const source = productDetail ?? summary;
  const formValues = {
    productName: source?.product_name ?? '',
    minInterestRate: source?.min_interest_rate?.toString() ?? '',
    maxInterestRate: source?.max_interest_rate?.toString() ?? '',
    minAmount: source?.min_amount?.toString() ?? '',
    maxAmount: source?.max_amount?.toString() ?? '',
    tenureMonths: source?.tenure_months?.toString() ?? '',
    description: productDetail?.description ?? '',
  };

  const selectedCategoryTermIds = productDetail?.categories ?? [];
  const selectedTagTermIds = productDetail?.tags ?? [];
  const selectedAttributeTermIds = productDetail?.attributes ? Object.values(productDetail.attributes).flat() : [];

  const footerActions = (
    <div className="flex flex-col gap-4 border-t border-[#E5E7EB] p-6 bg-gray-50/50">
      {actionMode ? (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200 w-full">
          <label htmlFor="reason" className="mb-1.5 block text-[14px] font-bold text-gray-900">
            {actionMode === 'reject' ? (
              <>Rejection Reason <span className="text-red-500">*</span></>
            ) : (
              <>Approval Comment <span className="text-red-500">*</span></>
            )}
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={actionMode === 'reject' ? "Please provide a reason for rejecting this product..." : "Please provide a comment for approving this product..."}
            className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${actionMode === 'reject' ? 'focus:border-red-500 focus:ring-red-500/20' : 'focus:border-[#16A34A] focus:ring-[#16A34A]/20'
              }`}
            rows={3}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-4">
        {actionMode ? (
          <>
            <button
              type="button"
              onClick={() => {
                setActionMode(null);
                setReason('');
              }}
              disabled={isMutating}
              className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <span className='font-semibold'>Cancel</span>
            </button>
            {actionMode === 'reject' ? (
              <button
                type="button"
                onClick={handleReject}
                disabled={isMutating || !reason.trim()}
                className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isMutating ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                <span className='font-semibold'>Confirm Reject</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isMutating || !reason.trim()}
                className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isMutating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                <span className='font-semibold'>Confirm Approve</span>
              </button>
            )}
          </>
        ) : readOnlyView ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50"
          >
            <span className='font-semibold'>Close</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActionMode('reject')}
              disabled={isMutating}
              className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <span className='font-semibold'>Reject...</span>
            </button>
            <button
              type="button"
              onClick={() => setActionMode('approve')}
              disabled={isMutating || isLoadingDetail}
              className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
            >
              <span className='font-semibold'>Approve...</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <BaseLoanProductModal
      isOpen={isOpen}
      onClose={onClose}
      mode="view"
      title={readOnlyView ? "View Loan Product" : "Review Loan Product"}
      subtitle={readOnlyView ? "Viewing product details." : "Review product details submitted by the agent."}
      form={formValues}
      imagePreview={productDetail?.image ?? null}
      fileInputRef={fileInputRef}
      categoryOptions={categoryOptions}
      tagOptions={tagOptions}
      realAttributes={realAttributes}
      selectedCategoryTermIds={selectedCategoryTermIds}
      selectedTagTermIds={selectedTagTermIds}
      selectedAttributeTermIds={selectedAttributeTermIds}
      globalError={mutationError}
      isLoadingDetail={isLoadingDetail}
      detailError={detailError}
      footerActions={footerActions}
    />
  );
}
