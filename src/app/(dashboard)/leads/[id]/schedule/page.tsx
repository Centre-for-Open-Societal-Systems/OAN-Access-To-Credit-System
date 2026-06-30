import { Metadata } from 'next';
import { ScheduleVisitClient } from '@/features/new-lead/components/ScheduleVisitClient';

export const metadata: Metadata = {
  title: 'Schedule Visit | Ethiopia OpenAgriNet Access to Credit',
  description: 'Schedule a field agent visit and view past visit history.',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScheduleVisitPage({ params }: PageProps) {
  const resolvedParams = await params;
  const leadId = resolvedParams.id;

  return <ScheduleVisitClient leadId={leadId} />;
}
