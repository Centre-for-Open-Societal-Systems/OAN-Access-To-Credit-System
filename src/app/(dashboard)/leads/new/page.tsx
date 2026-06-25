import { Metadata } from 'next';
import { CreateLeadForm } from '@/features/new-lead/components/new-lead/CreateLeadForm';

export const metadata: Metadata = {
  title: 'New Lead | Ethiopia OpenAgriNet Access to Credit',
  description: 'Create a new agricultural lead to begin the credit access process.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewLeadPage() {
  return <CreateLeadForm />;
}
