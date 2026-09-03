'use client';
import AgentApplicationListClient from '@/app/(dashboard)/(bank-agent)/agent-application-lists/components/AgentApplicationListClient';

/**
 * The same list the bank portals render, under the Development Agent's chrome.
 *
 * The one difference is where the pipeline comes from. A Dev Agent has no bank
 * binding, so the seller stage endpoint the bank copies use answers 403 for
 * them — leaving the status filter empty and every KPI card at zero. They read
 * `get_loan_metadata` instead, which resolves per role and returns the union of
 * stages across the banks they can see.
 */
export default function DevAgentApplicationListsPage() {
  return <AgentApplicationListClient />;
}
