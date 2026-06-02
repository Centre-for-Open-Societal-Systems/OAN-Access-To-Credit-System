'use client';

import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { setFormData, setStep, setApplicationId, resetForm } from '@/features/new-loan/store/newLoanFormSlice';
import { fetchLoans, fetchLoanSummary, selectQueryParams } from '@/features/loans/store/loanDashboardSlice';

import LoanKpiCard from '@/features/loans/components/LoanKpiCard';
import LoanDashboardHeader from '@/features/loans/components/LoanDashboardHeader';
import LoanWelcomeCard from '@/features/loans/components/LoanWelcomeCard';
import LoanSystemStatus from '@/features/loans/components/LoanSystemStatus';
import LoanToolbar from '@/features/loans/components/LoanToolbar';
import LoanTable from '@/features/loans/components/LoanTable';
import LoanPagination from '@/features/loans/components/LoanPagination';
import LoanNotifications from '@/features/loans/components/LoanNotifications';
import { CheckCircle2, Clock3, CircleAlert, ClipboardList, Clock, Globe, Tag, Calendar } from 'lucide-react';
import { mapLoanRowToFormFields } from '@/features/loans/utils/loanMapper';

const METRIC_CONFIG = [
  { key: 'total', label: 'Total Applications', helper: 'All loan types', helperIcon: Globe, icon: ClipboardList, tone: 'blue' },
  { key: 'approved', label: 'Approved', helper: 'Ready to disburse', helperIcon: Tag, icon: CheckCircle2, tone: 'green' },
  { key: 'pending', label: 'Pending Review', helper: 'In this period', helperIcon: Calendar, icon: Clock3, tone: 'amber' },
  { key: 'rejected', label: 'Rejected', helper: 'Needs attention', helperIcon: Clock, icon: CircleAlert, tone: 'red' },
];

export default function LoanApplicationDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectQueryParams);

  useEffect(() => {
    dispatch(fetchLoans(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    dispatch(fetchLoanSummary());
  }, [dispatch]);

  const handleView = useCallback((row: any) => {
    dispatch(resetForm());
    dispatch(setApplicationId(row.id));

    const formFields = mapLoanRowToFormFields(row);

    dispatch(setFormData(formFields));
    dispatch(setStep(6));
    router.push('/loans/new-loan-application-creation');
  }, [dispatch, router]);

  return (
    <div className="space-y-6">
      <LoanDashboardHeader />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <LoanWelcomeCard />
        <LoanSystemStatus />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_CONFIG.map((cfg) => (
          <LoanKpiCard key={cfg.label} cfg={cfg} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.42fr_0.78fr] items-start">
        <div className="overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <LoanToolbar />
          <LoanTable onView={handleView} />
          <LoanPagination />
        </div>

        <aside>
          <LoanNotifications />
        </aside>
      </section>
    </div>
  );
}
