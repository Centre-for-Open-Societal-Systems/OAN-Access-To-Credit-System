"use client";

import { useEffect, use } from 'react';
import { LeadLayoutGrid } from '@/features/leads/components/LeadLayoutGrid';
import { ScheduleNewVisitForm } from '@/features/new-lead/components/modals/ScheduleNewVisitForm';
import { VisitHistoryCard } from '@/features/new-lead/components/VisitHistoryCard';
import LeadContextBanner from '@/features/new-lead/components/LeadContextBanner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLeadDetailsThunk, fetchVisitSchedulesThunk } from '@/features/new-lead';
import { ScheduleVisitBanner } from '@/features/new-lead/components/ScheduleVisitBanner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ScheduleVisitPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (leadId) {
      dispatch(fetchLeadDetailsThunk(leadId));
      dispatch(fetchVisitSchedulesThunk(leadId));
    }
  }, [dispatch, leadId]);




  const sidebar = (
    <VisitHistoryCard />
  );

  return (
    <LeadLayoutGrid titleBanner={<ScheduleVisitBanner />} sidebar={sidebar} isViewMode={true}>
      <ScheduleNewVisitForm />
    </LeadLayoutGrid>
  );
}
