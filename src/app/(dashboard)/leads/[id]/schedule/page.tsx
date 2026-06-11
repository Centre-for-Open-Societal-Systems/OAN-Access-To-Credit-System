import { LeadLayoutGrid } from '@/features/leads/components/LeadLayoutGrid';
import { ScheduleNewVisitForm } from '@/features/new-lead/components/modals/ScheduleNewVisitForm';
import { VisitHistoryCard } from '@/features/new-lead/components/VisitHistoryCard';
import LeadContextBanner from '@/features/new-lead/components/LeadContextBanner';

export default async function ScheduleVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const leadId = resolvedParams.id;

  const titleBanner = (
    <LeadContextBanner
      leadId={`#${leadId}`}
      actionType="visit-scheduled"
    />
  );

  const sidebar = (
    <VisitHistoryCard />
  );

  return (
    <LeadLayoutGrid titleBanner={titleBanner} sidebar={sidebar}>
      <ScheduleNewVisitForm />
    </LeadLayoutGrid>
  );
}
