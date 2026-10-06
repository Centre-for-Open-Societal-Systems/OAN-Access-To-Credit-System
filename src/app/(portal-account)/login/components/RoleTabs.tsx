'use client';

import { Landmark, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

/**
 * The Bank Admin / Bank Agent switch above the bank sign-in form.
 *
 * Both tabs were written out longhand, which is why the second one drifted: the
 * corner rounding, the offset and the highlight are position-dependent, and
 * every one of those was a separate literal to keep in step by hand. They are
 * per-tab data now, so the markup is written once.
 */
interface RoleTab {
  href: string;
  icon: LucideIcon;
  iconWrapper: string;
  iconColor: string;
  title: string;
  /** Split across two lines on desktop, one on mobile. */
  description: React.ReactNode;
  /** Corner rounding and overlap, which depend on where the tab sits. */
  shape: string;
  /** The highlight sits behind the tab, so it needs the same corners. */
  highlightShape: string;
}

const TABS: readonly RoleTab[] = [
  {
    href: '/login/bank-admin',
    icon: Landmark,
    iconWrapper: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Bank Admin',
    description: (
      <>
        Manage products, <br className="hidden sm:block" />
        approvals &amp; KYC
      </>
    ),
    shape: 'rounded-t-xl rounded-b-none sm:rounded-none sm:rounded-l-xl',
    highlightShape: 'rounded-t-xl sm:rounded-none sm:rounded-l-xl',
  },
  {
    href: '/login/bank-agent',
    icon: UserCog,
    iconWrapper: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
    title: 'Bank Agent',
    description: (
      <>
        Create loan products <br className="hidden sm:block" />
        for approval
      </>
    ),
    shape: 'rounded-b-xl rounded-t-none sm:rounded-none sm:rounded-r-xl -mt-[2px] sm:-mt-0 sm:-ml-[2px]',
    highlightShape: 'rounded-b-xl sm:rounded-none sm:rounded-r-xl',
  },
];

export function RoleTabs() {
  const pathname = usePathname();

  return (
    <div className="flex w-full max-w-lg mx-auto mb-8 flex-col sm:flex-row relative">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex items-start gap-2.5 w-full sm:w-1/2 p-3 transition-colors border-2 ${tab.shape} ${
              isActive ? 'z-10 border-transparent' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-role-tab"
                className={`absolute inset-0 z-0 bg-[#F4FDF7] border-2 border-[#16A34A] ${tab.highlightShape}`}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <div className={`relative z-10 w-10 h-10 rounded-full ${tab.iconWrapper} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${tab.iconColor}`} aria-hidden="true" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-tight mb-1">
                {tab.title}
              </span>
              <span className="text-[12px] sm:text-[12.5px] text-gray-500 leading-snug font-medium tracking-tight">
                {tab.description}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
