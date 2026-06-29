'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLoans,
  fetchLoanSummary,
  selectQueryParams,
  selectLoansError,
  selectIsLoansLoading,
  selectTotalCount,
} from '@/features/loans/store/loanDashboardSlice';
import { AccessDenied } from '@/components/AccessDenied';
import { ConnectionError } from '@/components/ConnectionError';
import { ApiErrorCode, classifyError } from '@/lib/api/apiErrors';

import LoanKpiCard, { MetricConfig } from '@/features/loans/components/LoanKpiCard';
import LoanDashboardHeader from '@/features/loans/components/LoanDashboardHeader';
import LoanToolbar from '@/features/loans/components/LoanToolbar';
import LoanTable, { LoanTableRow } from '@/features/loans/components/LoanTable';
import LoanPagination from '@/features/loans/components/LoanPagination';
import dynamic from 'next/dynamic';

const LoanApplicationModal = dynamic(() => import('@/features/loans/components/modals/LoanApplicationModal'), {
  ssr: false,
});
import { Users, FileText, Award, XCircle } from 'lucide-react';

const METRIC_CONFIG: MetricConfig[] = [
  { key: 'total', label: <span className="font-medium text-gray-500"><strong className="font-bold text-gray-700">Overall</strong> Applications</span>, icon: Users, tone: 'blue' },
  { key: 'processing', label: 'Processing', icon: FileText, tone: 'cyan' },
  { key: 'approved', label: 'Granted', icon: Award, tone: 'green' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'red' },
];

export function LoanApplicationDashboardClient() {
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectQueryParams);
  const loansError = useAppSelector(selectLoansError);
  const isLoading = useAppSelector(selectIsLoansLoading);
  const totalCount = useAppSelector(selectTotalCount);

  const [selectedRow, setSelectedRow] = useState<LoanTableRow | null>(null);

  const loadLoans = useCallback(() => {
    dispatch(fetchLoans(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  useEffect(() => {
    dispatch(fetchLoanSummary());
  }, [dispatch]);

  const handleView = useCallback((row: LoanTableRow) => {
    setSelectedRow(row);
  }, []);

  // Same error taxonomy as the leads dashboard: 403 → Access Denied, 5xx /
  // network unreachable (e.g. proxy 502) → retryable connection error. 401 is
  // handled globally by the store middleware (logs out). The connection error
  // only replaces the dashboard when there is nothing already on screen — a
  // failed background refresh keeps the stale table rather than blanking it.
  if (classifyError(loansError) === ApiErrorCode.Forbidden) {
    return <AccessDenied message="You don't have permission to view the loan applications dashboard." />;
  }

  if (loansError && totalCount === 0 && !isLoading) {
    return <ConnectionError onRetry={loadLoans} />;
  }

  return (
    <div className="">
      <LoanDashboardHeader />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CONFIG.map((cfg, index) => (
          <LoanKpiCard key={cfg.key} cfg={cfg} index={index} />
        ))}
      </section>

      <section className="mt-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <LoanToolbar />
          <LoanTable onView={handleView} />
          <LoanPagination />
        </div>
      </section>

      <LoanApplicationModal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        data={selectedRow}
      />
    </div>
  );
}
