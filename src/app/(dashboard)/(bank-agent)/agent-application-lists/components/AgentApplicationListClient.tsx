'use client';

import { AccessDenied } from '@/components/AccessDenied';
import { ConnectionError } from '@/components/ConnectionError';
import {
  BankApplicationRow,
  fetchBankApplicationSummary,
  fetchBankApplications,
  fetchBankStages,
  selectBankApplicationsError,
  selectBankApplicationsLoading,
  selectBankQueryParams,
  selectBankTotalCount,
} from '@/features/loans/store/bankApplicationsSlice';
import { ApiErrorCode, classifyError } from '@/lib/api/apiErrors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import AgentApplicationTable from './AgentApplicationTable';
import StatCards from './KPICards';

// Read-only summary. A bank reviews an application here; it does not edit one,
// so this is the same view the Development Agent's dashboard opens.
const LoanApplicationModal = dynamic(
  () => import('@/features/loans/components/modals/LoanApplicationModalLegacy'),
  { ssr: false }
);

export default function AgentApplicationListClient() {
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectBankQueryParams);
  const error = useAppSelector(selectBankApplicationsError);
  const isLoading = useAppSelector(selectBankApplicationsLoading);
  const totalCount = useAppSelector(selectBankTotalCount);

  const [selectedRow, setSelectedRow] = useState<BankApplicationRow | null>(null);

  const loadApplications = useCallback(
    () => dispatch(fetchBankApplications(queryParams)),
    [dispatch, queryParams]
  );

  useEffect(() => {
    // Abort the in-flight request when the query changes (or on unmount) so a
    // slower earlier response can't overwrite the results for a newer query.
    const promise = loadApplications();
    return () => {
      promise.abort();
    };
  }, [loadApplications]);

  useEffect(() => {
    dispatch(fetchBankApplicationSummary());
    dispatch(fetchBankStages());
  }, [dispatch]);

  const handleView = useCallback((row: BankApplicationRow) => {
    setSelectedRow(row);
  }, []);

  // Same error taxonomy as the loan dashboard: 403 → Access Denied, 5xx /
  // unreachable → retryable connection error. 401 is handled globally by the
  // store middleware (logs out). The connection error only replaces the page
  // when there is nothing already on screen — a failed background refresh keeps
  // the stale table rather than blanking it.
  if (classifyError(error) === ApiErrorCode.Forbidden) {
    return <AccessDenied message="You don't have permission to view your bank's applications." />;
  }

  if (error && totalCount === 0 && !isLoading) {
    return <ConnectionError onRetry={loadApplications} />;
  }

  return (
    <div className="mx-auto w-full space-y-4">
      {/* Stat Cards Row */}
      <StatCards />

      <div className="bg-white border border-[#F1F3F4] rounded-2xl shadow-sm flex flex-col">
        {/* Table */}
        <AgentApplicationTable onView={handleView} />
      </div>

      <LoanApplicationModal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        data={selectedRow}
      />
    </div>
  );
}
