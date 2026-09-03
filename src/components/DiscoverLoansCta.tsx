'use client';

import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';

export interface DiscoverLoansCtaProps {
  /**
   * Where the catalogue lives for this portal. The two differ — a farmer browses
   * `/discover-loans`, a development agent `/loan-discovery` — so each caller
   * passes its own rather than this guessing from the current URL.
   */
  href?: string;
  /**
   * `banner` is a compact strip for a dashboard that already has content.
   * `empty` is the centred block that stands in for an empty list.
   */
  variant?: 'banner' | 'empty';
  title?: string;
  description?: string;
  /** Wording for the link itself. */
  actionLabel?: string;
}

/**
 * The route into the loan catalogue, for the screens that are not the catalogue.
 *
 * Discover Loans was reachable only from the sidebar, which left the two places
 * someone actually notices they want a loan — an empty applications list and the
 * dashboard — with no way forward.
 */
export function DiscoverLoansCta({
  href = '/discover-loans',
  variant = 'banner',
  title = 'Find a loan that fits',
  description = 'Browse loan products from every participating bank and compare amounts, rates and tenure.',
  actionLabel = 'Discover Loans',
}: DiscoverLoansCtaProps) {
  if (variant === 'empty') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F9F3] text-[#16A34A]">
          <Compass className="h-7 w-7" />
        </div>
        <h3 className="text-[17px] font-bold text-gray-900">{title}</h3>
        <p className="max-w-sm text-[14px] leading-relaxed text-gray-500">{description}</p>
        <Link
          href={href}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700"
        >
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#F1F3F4] bg-gradient-to-r from-[#E6F9F3] via-white to-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-0 sm:pr-4 w-full">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#16A34A] shadow-sm">
          <Compass className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex w-full sm:w-auto justify-center shrink-0 items-center rounded-lg bg-[#16A34A] px-5 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-green-700"
      >
        <span className="inline-flex items-center gap-2 text-white whitespace-nowrap">{actionLabel} <ArrowRight className="h-4 w-4" /></span>
      </Link>
    </div>
  );
}
