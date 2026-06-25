import { Metadata } from 'next';
import { NewLeadDashboard } from '@/features/new-lead/components/new-lead/NewLeadDashboard';

export const metadata: Metadata = {
  title: 'Lead Overview | Ethiopia OpenAgriNet Access to Credit',
  description: 'Review lead details, consent status, and credit information.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LeadOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params promise as required by Next.js 15+
  const resolvedParams = await params;
  return <NewLeadDashboard id={resolvedParams.id} />;
}
