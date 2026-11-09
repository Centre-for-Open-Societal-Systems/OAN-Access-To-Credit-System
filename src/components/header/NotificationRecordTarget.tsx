'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

type RecordType = 'product' | 'application';

const LoanApplicationModal = dynamic(
  () => import('@/features/loans/components/modals/LoanApplicationModalLegacy')
);
const ReviewProductModal = dynamic(
  () => import('@/features/seller/components/product-approvals/ReviewProductModal')
    .then((module) => module.ReviewProductModal)
);

function RecordTarget({ type }: { type: RecordType }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params.get(type);
  const product = useMemo(() => id ? { name: id } : null, [id]);
  if (!id?.trim()) return null;

  const close = () => {
    const remaining = new URLSearchParams(params.toString());
    remaining.delete(type);
    router.replace(`${pathname}${remaining.size ? `?${remaining}` : ''}`, { scroll: false });
  };

  return type === 'product' ? (
    <ReviewProductModal key={id} isOpen onClose={close} product={product} readOnlyView />
  ) : (
    <LoanApplicationModal key={id} isOpen onClose={close} applicationId={id} />
  );
}

/** Fetches the referenced record by ID, independent of list filters/pagination. */
export function NotificationRecordTarget({ type }: { type: RecordType }) {
  return (
    <Suspense fallback={null}>
      <RecordTarget type={type} />
    </Suspense>
  );
}
