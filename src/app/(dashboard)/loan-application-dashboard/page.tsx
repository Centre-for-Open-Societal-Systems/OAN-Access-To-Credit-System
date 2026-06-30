import { Metadata } from 'next';
import { LoanApplicationDashboardClient } from '@/features/loans/components/LoanApplicationDashboardClient';

export const metadata: Metadata = {
  title: 'Loan Applications Dashboard | Ethiopia OpenAgriNet Access to Credit',
  description: 'Manage and review agricultural credit applications and process farmer credit requests.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoanApplicationDashboardPage() {
  return <LoanApplicationDashboardClient />;
}
