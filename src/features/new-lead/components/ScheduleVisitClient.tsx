'use client';

import { useEffect } from 'react';
import { LeadLayoutGrid } from '@/features/leads/components/LeadLayoutGrid';
import { ScheduleNewVisitForm } from '@/features/new-lead/components/modals/ScheduleNewVisitForm';
import { VisitHistoryCard } from '@/features/new-lead/components/VisitHistoryCard';
import { useAppDispatch } from '@/store/hooks';
import { fetchLeadDetailsThunk, fetchVisitSchedulesThunk } from '@/features/new-lead';
import { ScheduleVisitBanner } from '@/features/new-lead/components/ScheduleVisitBanner';

interface ScheduleVisitClientProps {
  leadId: string;
}

export function ScheduleVisitClient({ leadId }: ScheduleVisitClientProps) {
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
