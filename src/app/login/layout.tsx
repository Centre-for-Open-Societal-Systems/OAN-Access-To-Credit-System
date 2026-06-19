import type { Metadata } from 'next';

// The login page is a client component and can't export metadata itself, so
// this server-component layout marks the auth route as noindex/nofollow to keep
// it out of search engines.
export const metadata: Metadata = {
  title: 'Sign in · Access to Credit System',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
