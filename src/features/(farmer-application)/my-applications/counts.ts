import type { LoanStatusMeta } from '@/lib/api/api.schemas';
import { archetypeOf } from '@/features/loans';
import type { FarmerLoanApplication } from '../types';

/** The "everything" tab. Not a status — no bank can define a stage by this name. */
export const ALL_TAB = 'total';

export interface StageTab {
  /** Stable key for React, and the value the tab selection carries. */
  value: string;
  label: string;
  count: number;
  /** Drives the badge colour and the card theme. */
  archetype: string;
  /** Terminal stages are shown but offer no action. */
  isTerminal: boolean;
}

/**
 * The tabs and summary cards for My Applications, one per stage.
 *
 * Both halves are needed because neither is sufficient alone: the metadata says
 * which stages exist and in what order — including ones the farmer currently has
 * nothing in, which should still show as 0 rather than vanish — while the
 * applications supply the counts. Any status appearing on an application but
 * missing from the metadata (a stage renamed since) is appended, so a visible
 * row is never uncounted.
 *
 * This replaces a hardcoded four — Draft / Under Review / Disbursed / Rejected —
 * none of which the API returns.
 */
export function buildStageTabs(
  applications: readonly FarmerLoanApplication[],
  statuses: readonly LoanStatusMeta[],
): StageTab[] {
  const counts = new Map<string, number>();
  for (const application of applications) {
    const key = application.status.toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const tabs: StageTab[] = [...statuses]
    .sort((a, b) => (a.sequence ?? Number.MAX_SAFE_INTEGER) - (b.sequence ?? Number.MAX_SAFE_INTEGER))
    .map((meta) => ({
      value: meta.status,
      label: meta.status,
      count: counts.get(meta.status.toLowerCase()) ?? 0,
      archetype: archetypeOf(meta),
      isTerminal: Boolean(meta.is_terminal),
    }));

  const known = new Set(tabs.map((tab) => tab.value.toLowerCase()));
  for (const application of applications) {
    const label = application.status;
    if (!label || known.has(label.toLowerCase())) continue;
    known.add(label.toLowerCase());
    tabs.push({
      value: label,
      label,
      count: counts.get(label.toLowerCase()) ?? 0,
      archetype: archetypeOf(application),
      isTerminal: Boolean(application.is_terminal),
    });
  }

  return tabs;
}

/** Applications belonging to one tab. `ALL_TAB` matches everything. */
export function filterByTab(
  applications: readonly FarmerLoanApplication[],
  tab: string,
): FarmerLoanApplication[] {
  if (tab === ALL_TAB) return [...applications];
  return applications.filter(
    (application) => application.status.toLowerCase() === tab.toLowerCase()
  );
}
