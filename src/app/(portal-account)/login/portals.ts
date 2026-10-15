import type { PortalLoginFormProps } from '@/features/auth/components/PortalLoginForm';
import { homeRouteFor } from '@/features/auth/rbac';

/**
 * What distinguishes one sign-in portal from another.
 *
 * There were four components here — `FarmerLoginForm`, `BankAdminLoginForm`,
 * `BankAgentLoginForm`, `DevelopmentAgentLoginForm` — and by the time the fourth
 * was written they had converged on the same three lines each: render
 * `PortalLoginForm`, sometimes wrap it in `RoleTabs`, pass a subtitle. The only
 * thing a fifth role would add is a fifth file that says nothing new.
 *
 * So the difference between portals is data, and it lives here. `PortalSignIn`
 * renders it. Adding a role is an entry in this record and a `page.tsx`.
 */
export type PortalId = 'farmer' | 'bank-admin' | 'bank-agent' | 'development-agent';

export interface PortalConfig {
  /** Eyebrow on the green panel, naming the portal being signed in to. */
  badge: string;
  /** Whether the Bank Admin / Bank Agent tab pair sits above the form. Only the
   *  two bank portals are alternatives to each other; the rest are not. */
  roleTabs?: boolean;
  /** Users of this portal sign in only through single sign-on (the OpenG2P IAM
   *  service): the portal shows an SSO button and no password form. */
  sso?: boolean;
  form: PortalLoginFormProps;
}

export const PORTALS: Record<PortalId, PortalConfig> = {
  farmer: {
    badge: 'Farmer Portal',
    form: {
      heading: 'Farmer Sign In',
      subtitle: 'Sign in to browse and apply for loans',
      // The one portal whose identifier is an email and nothing else. In
      // production a farmer authenticates against the Fayda registry over OAuth
      // — the platform holds no farmer credential of its own — and email plus
      // password is the stand-in until that lands. A phone number is a linking
      // key for the consent webhook, never a login.
      usernameLabel: 'Email',
      usernameType: 'email',
      usernamePlaceholder: 'you@example.com',
      allowedKinds: ['farmer'],
      // rbac's HOME_ROUTE is the single source of truth for where a role lands,
      // so no portal can drift from what the route guard considers home.
      redirectTo: (user) => homeRouteFor(user.kind),
      showRegisterLink: true,
      // Farmers self-register on their own form, not the bank-side seller
      // onboarding at /create-account.
      registerHref: '/signup/farmer',
    },
  },

  'bank-admin': {
    badge: 'Bank Portal',
    roleTabs: true,
    form: {
      subtitle: 'Manage KYC verification, loan products & approve agent submissions',
      allowedKinds: ['bank_admin', 'marketplace'],
      // Not homeRouteFor: an admin whose bank has not been provisioned yet has
      // no dashboard to land on, and the onboarding gate would bounce them
      // straight back here.
      redirectTo: (user) => (user.kind === 'bank_admin' && !user.bankId ? '/onboarding' : '/dashboard'),
      showRegisterLink: true,
    },
  },

  'bank-agent': {
    badge: 'Bank Portal',
    roleTabs: true,
    form: {
      subtitle: 'Access your agent dashboard and manage loan submissions',
      allowedKinds: ['bank_agent'],
      redirectTo: () => '/agent-dashboard',
    },
  },

  'development-agent': {
    badge: 'Field Agent Portal',
    // Development Agents are SSO-only; the backend refuses a local account
    // holding the role (oan_a2c/api/auth.py, require_sso_for_development_agents).
    sso: true,
    form: {
      subtitle: 'Coordinate field-level agricultural credit access across regions',
      allowedKinds: ['dev_agent'],
      redirectTo: (user) => homeRouteFor(user.kind),
    },
  },
};
