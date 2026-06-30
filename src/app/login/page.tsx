import { Metadata } from 'next';
import { LoginClient } from '@/features/auth/components/LoginClient';

export const metadata: Metadata = {
  title: 'Field Agent Login | Ethiopia OpenAgriNet Access to Credit',
  description: 'Log in to the Field Agent Portal to manage your agricultural lead pipeline and process credit applications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
