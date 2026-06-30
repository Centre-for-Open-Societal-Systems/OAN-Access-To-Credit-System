import { Metadata } from 'next';
import { LeadsDashboardClient } from '@/features/leads/components/LeadsDashboardClient';

export const metadata: Metadata = {
  title: 'Leads Dashboard | Ethiopia OpenAgriNet Access to Credit',
  description: 'Manage, filter, and process your agricultural lead pipeline to facilitate credit access.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LeadsDashboardPage() {
  return <LeadsDashboardClient />;
}
