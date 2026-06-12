import { LeadLayoutGrid } from '@/features/leads/components/LeadLayoutGrid';
import { ScheduleNewVisitForm } from '@/features/new-lead/components/modals/ScheduleNewVisitForm';
import { VisitHistoryCard } from '@/features/new-lead/components/VisitHistoryCard';
import { ScheduleVisitBanner } from '@/features/new-lead/components/ScheduleVisitBanner';

export default async function ScheduleVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const leadId = resolvedParams.id;

  const sidebar = (
    <VisitHistoryCard />
  );

  return (
    <LeadLayoutGrid titleBanner={<ScheduleVisitBanner />} sidebar={sidebar} isViewMode={true}>
      <ScheduleNewVisitForm />
    </LeadLayoutGrid>
  );
}
