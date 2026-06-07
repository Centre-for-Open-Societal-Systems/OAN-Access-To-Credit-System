'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLoans, fetchLoanSummary, selectQueryParams } from '@/features/loans/store/loanDashboardSlice';

import LoanKpiCard from '@/features/loans/components/LoanKpiCard';
import LoanDashboardHeader from '@/features/loans/components/LoanDashboardHeader';
import LoanToolbar from '@/features/loans/components/LoanToolbar';
import LoanTable, { LoanTableRow } from '@/features/loans/components/LoanTable';
import LoanPagination from '@/features/loans/components/LoanPagination';
import LoanApplicationModal from '@/features/loans/components/LoanApplicationModal';
import { Users, FileText, Award, XCircle } from 'lucide-react';

const METRIC_CONFIG = [
  { key: 'total', label: 'Overall Applications', icon: Users, tone: 'blue' },
  { key: 'processing', label: 'Processing', icon: FileText, tone: 'cyan' },
  { key: 'approved', label: 'Approved', icon: Award, tone: 'orange' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'red' },
];

export default function LoanApplicationDashboard() {
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
          <LoanKpiCard key={cfg.label} cfg={cfg} index={index} />
        ))}
      </section>

      <section className="mt-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
