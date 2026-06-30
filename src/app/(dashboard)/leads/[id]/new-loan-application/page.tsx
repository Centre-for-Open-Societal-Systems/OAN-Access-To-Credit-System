import { Metadata } from 'next';
import { NewLoanOrchestrator } from '@/features/new-loan/components/NewLoanOrchestrator';

export const metadata: Metadata = {
  title: 'New Loan Application | Ethiopia OpenAgriNet Access to Credit',
  description: 'Initiate and submit a new credit application for the selected farmer.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewLoanApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div>
      <NewLoanOrchestrator leadId={resolvedParams.id} />
    </div>
  );
}
