'use client';

import { PartnerBanks } from '@/app/(portal-account)/components/PartnerBanks';
import { SessionEndedNotice } from '@/components/SessionEndedNotice';
import { Button } from '@/components/ui/Button';
import { MotionEffects } from '@/components/motion/MotionEffect';
import { ArrowRight, CheckCircle, Landmark, Users, Tractor } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PORTALS } from '@/app/(portal-account)/login/portals';
import type { LoginProvider } from '@/lib/loginOptions';

/**
 * The role chooser: the one page every sign-out lands on.
 *
 * Each card used to be written out in full — four copies of the same 30 lines,
 * differing in an icon, two colours and three strings — with the routes kept in
 * a separate map that had to be edited in step. They are one array now, so a
 * card cannot exist without a destination and vice versa.
 */
interface RoleChoice {
  id: string;
  href: string;
  icon: LucideIcon;
  iconWrapper: string;
  iconColor: string;
  title: string;
  description: string;
  /** IAM login option keys that sign this role in; the first one offered wins. */
  iamKeys?: readonly string[] | undefined;
}

const ROLE_CHOICES: readonly RoleChoice[] = [
  {
    id: 'farmer',
    href: '/login/farmer',
    icon: Tractor,
    iconWrapper: 'bg-[#E8F8EE]',
    iconColor: 'text-[#16A34A]',
    title: 'Farmer Applicant',
    description: 'Ethiopia OAN Farmer Portal',
    iamKeys: PORTALS.farmer.iamKeys,
  },
  {
    id: 'bank',
    href: '/login/bank-admin',
    icon: Landmark,
    iconWrapper: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Bank',
    description: 'Manage system setting and user access',
  },
  {
    id: 'dev-agent',
    href: '/login/development-agent',
    icon: Users,
    iconWrapper: 'bg-[#FFF4E5]',
    iconColor: 'text-orange-500',
    title: 'Development Agent',
    description: 'Support farmer outreach and data collection',
    iamKeys: PORTALS['development-agent'].iamKeys,
  },
  // TODO: Restore this option with the Settings icon when a dedicated
  // Administrator login interface is available. Routing it to bank-admin
  // incorrectly presents the Bank role login interface.
  // {
  //   id: 'admin',
  //   href: '/login/administrator',
  //   icon: Settings,
  //   iconWrapper: 'bg-[#F5F3FF]',
  //   iconColor: 'text-purple-600',
  //   title: 'Administrator',
  //   description: 'Monitor activity and manage system access',
  // },
];

export function LoginForm({ providers = null }: { providers?: LoginProvider[] | null }) {
  const router = useRouter();
  const [role, setRole] = useState(ROLE_CHOICES[0]!.id);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignInSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const choice = ROLE_CHOICES.find((c) => c.id === role);
    const href = choice?.href ?? '/';

    // A role with an IAM login option skips the portal page and goes straight
    // to the identity provider. The portal page stays the fallback when the
    // option list could not be loaded or does not offer one for this role.
    const key = choice?.iamKeys?.find((k) => providers?.some((p) => p.key === k));
    if (key) {
      setIsRedirecting(true);
      // A route handler that redirects to the identity provider, not a page:
      // router.push cannot follow it.
      window.location.assign(`/api/auth/sso/login?${new URLSearchParams({ key, from: href, origin: window.location.origin })}`);
      return;
    }
    router.push(href);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full px-0 sm:px-0 max-w-lg mx-auto w-full">
      {/* Every sign-out in the app lands here now, not on a per-role portal, so
          this is where an idle timeout or an expired session gets explained. */}
      <SessionEndedNotice />

      <div className="w-full flex flex-col items-center text-center mb-8">
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">Welcome to the Portal</h2>
        <p className="text-[#6B7280] text-[14px] sm:text-[15px] font-medium px-2 sm:px-0 w-full sm:w-auto sm:whitespace-nowrap md:whitespace-normal mx-auto">Select your role to access the agricultural credit system network.</p>
      </div>

      {/* Role Selectors */}
      <div className="w-full space-y-4 mb-8">
        <MotionEffects fade zoom={{ initialScale: 0.98 }} stagger={40} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}>
          {ROLE_CHOICES.map((choice) => {
            const isSelected = role === choice.id;
            const Icon = choice.icon;

            return (
              <label
                key={choice.id}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A] ${isSelected ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className={`w-12 h-12 rounded-full ${choice.iconWrapper} flex items-center justify-center mr-4 shrink-0 overflow-hidden`}>
                  <Icon className={`w-6 h-6 ${choice.iconColor}`} aria-hidden="true" />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-gray-900 text-[15px]">{choice.title}</div>
                  <div className="text-[14px] text-gray-500 font-medium mt-0.5">{choice.description}</div>
                </div>
                <input
                  type="radio"
                  name="role"
                  value={choice.id}
                  checked={isSelected}
                  onChange={() => setRole(choice.id)}
                  className="sr-only"
                />
                <div className="relative w-6 h-6 flex items-center justify-center shrink-0" aria-hidden="true">
                  <AnimatePresence initial={false}>
                    {isSelected ? (
                      <motion.div key="checked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                        <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                      </motion.div>
                    ) : (
                      <motion.div key="unchecked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </label>
            );
          })}
        </MotionEffects>
      </div>

      <form className="w-full mb-10" onSubmit={handleSignInSubmit}>
        <Button type="submit" size="none" isLoading={isRedirecting} className="w-full py-4 text-[14px] space-x-2 active:scale-[0.98]">
          <span className="font-semibold">{isRedirecting ? 'Redirecting…' : 'Next Step'}</span>
          {!isRedirecting && <ArrowRight size={18} strokeWidth={2.5} />}
        </Button>
      </form>

      <PartnerBanks />
    </div>
  );
}
