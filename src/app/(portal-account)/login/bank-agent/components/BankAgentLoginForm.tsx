'use client';

import { RoleTabs } from '@/app/(portal-account)/login/components/RoleTabs';
import { PortalLoginForm } from '@/features/auth/components/PortalLoginForm';

export function BankAgentLoginForm() {
  return (
    <div className="w-full flex flex-col">
      <RoleTabs />
      <PortalLoginForm
        subtitle="Access your agent dashboard and manage loan submissions"
        usernamePlaceholder="test_agent@coopbank.com"
        allowedKinds={['bank_agent']}
        redirectTo={() => '/agent-dashboard'}
        showRegisterLink
      />
    </div>
  );
}
