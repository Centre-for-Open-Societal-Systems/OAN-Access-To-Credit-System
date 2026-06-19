'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLoans, fetchLoanSummary, selectQueryParams } from '@/features/loans/store/loanDashboardSlice';

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

  const [selectedRow, setSelectedRow] = useState<LoanTableRow | null>(null);

  useEffect(() => {
    dispatch(fetchLoans(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    dispatch(fetchLoanSummary());
  }, [dispatch]);

  const handleView = useCallback((row: LoanTableRow) => {
    setSelectedRow(row);
  }, []);

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
