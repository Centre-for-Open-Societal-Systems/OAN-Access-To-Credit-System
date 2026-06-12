import { LeadDashboard } from '@/features/leads/components/LeadDashboard';

export default async function LeadOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params promise as required by Next.js 15+
  const resolvedParams = await params;
  return <LeadDashboard id={resolvedParams.id} />;
}
