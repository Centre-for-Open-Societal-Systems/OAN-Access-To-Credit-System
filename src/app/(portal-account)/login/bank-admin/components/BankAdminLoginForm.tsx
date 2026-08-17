'use client';

import { RoleTabs } from '@/app/(portal-account)/login/components/RoleTabs';
import { PortalLoginForm } from '@/features/auth/components/PortalLoginForm';

export function BankAdminLoginForm() {
  return (
    <div className="w-full flex flex-col">
      <RoleTabs />
      <PortalLoginForm
        subtitle="Manage KYC verification, loan products & approve agent submissions"
        allowedKinds={['bank_admin', 'marketplace']}
        redirectTo={(user) =>
          user.kind === 'bank_admin' && !user.bankId ? '/onboarding' : '/dashboard'
        }
        showRegisterLink
      />
    </div>
  );
}
