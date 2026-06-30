import type { Metadata } from 'next';
import { Roboto, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/main.scss';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Access to Credit System',
  description: 'Manage, filter, and process your lead and loan pipelines.',
};

// Force dynamic rendering so the per-request CSP nonce (set in src/proxy.ts)
// can be stamped onto Next's script tags.
//
// Why this is needed: the App Router emits inline <script> tags every request
// (the streamed RSC payload via self.__next_f, plus hydration runtime). Their
// content varies per request, so a CSP hash allowlist can't cover them; the
// only way to permit them under a strict policy is a per-request nonce. A
// statically prerendered page is built once and can't carry a per-request
// nonce, so under 'strict-dynamic' the browser would block every script
// (blank page). Rendering dynamically lets Next inject the matching nonce.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
