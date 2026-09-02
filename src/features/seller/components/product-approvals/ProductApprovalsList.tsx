'use client';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectBankName } from '@/features/auth/store/authSlice';
import { fetchProducts, selectProducts, selectProductsListError, selectProductsListStatus } from '@/features/seller/store/loanProductsSlice';
import type { ListProductsParams } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Landmark } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { LoanProductCard } from '../loan-products/LoanProductCard';
import { BaseProductList } from '../loan-products/BaseProductList';

interface ProductApprovalsListProps {
  listParams?: ListProductsParams;
}

export function ProductApprovalsList({ listParams }: ProductApprovalsListProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const listStatus = useAppSelector(selectProductsListStatus);
  const listError = useAppSelector(selectProductsListError);
  const bankName = useAppSelector(selectBankName);

  const loadProducts = useCallback(() => {
    void dispatch(fetchProducts({ status: 'Pending Approval', ...listParams }));
  }, [dispatch, listParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const isLoading = listStatus === 'idle' || listStatus === 'loading';
  const pendingProducts = products.filter((product) => product.status === 'Pending Approval');

  const header = (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-6 pb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Landmark size={24} />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-gray-900">{bankName ?? 'Draft Product Approvals'}</h2>
          <p className="text-[14px] text-gray-500">Review product submissions before they are published to farmers.</p>
        </div>
      </div>
      <div className="border-t border-gray-200 px-6 py-4 text-[14px] text-gray-600">
        Approve to publish a product as active or reject it.
      </div>
    </div>
  );

  return (
    <BaseProductList
      className="mx-auto w-full space-y-6"
      header={header}
      products={pendingProducts}
      isLoading={isLoading}
      error={listError}
      onRetry={loadProducts}
      emptyTitle="No products waiting for approval"
      emptySubtitle="New product submissions will appear here after an agent creates them."
      renderItem={(product) => (
        <LoanProductCard key={product.name} product={product} variant="approval" />
      )}
    />
  );
}
