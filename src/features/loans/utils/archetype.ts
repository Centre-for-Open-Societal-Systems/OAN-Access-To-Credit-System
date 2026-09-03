import type { LoanStage, LoanStatusMeta } from '@/lib/api/api.schemas';
import type { StageFilterOption } from '../types/loanStages.types';
import { compareStageSequence, getStageStyle } from './stageStyles';

/**
 * The four workflow buckets every bank's pipeline collapses into.
 *
 * Stage *labels* are tenant free text — one bank's "Underwriting" is another's
 * "Credit Review" — so a client can never key on them. The archetype is the
 * platform-level constant underneath, and it is what `get_all_loans` accepts in
 * its `archetype` filter. `In Transition` is internal on the backend and never
 * appears as a status in a response, but it is a valid filter value.
 */
export const ARCHETYPES = ['Active', 'In Transition', 'Completed', 'Rejected'] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export interface ArchetypeCounts {
  total: number;
  active: number;
  inTransition: number;
  completed: number;
  cancelled: number;
}

/**
 * Which bucket a status falls in, derived from the two flags the backend sends
 * alongside every stage.
 *
 * `is_terminal` says the application has stopped moving; `is_successful` says
 * how it stopped. A status carrying neither is either a draft (no `stage_id`,
 * i.e. still with the applicant) or a stage mid-pipeline.
 */
export function archetypeOf(meta: {
  stage_id?: string | null | undefined;
  is_terminal?: boolean | null | undefined;
  is_successful?: boolean | null | undefined;
}): Archetype {
  if (meta.is_terminal) return meta.is_successful ? 'Completed' : 'Rejected';
  return meta.stage_id ? 'In Transition' : 'Active';
}

/**
 * Folds `get_loan_summary`'s per-stage-label counts into archetype buckets,
 * using the caller-scoped status metadata to classify each label.
 *
 * A label with no matching metadata entry still counts toward the total — the
 * figure the user reads has to add up even when a stage was renamed between the
 * two requests.
 */
export function bucketStagesByArchetype(
  stageCounts: Record<string, number> | undefined,
  statuses: readonly LoanStatusMeta[],
): ArchetypeCounts {
  const byLabel = new Map(statuses.map((meta) => [meta.status.toLowerCase(), meta]));
  const counts: ArchetypeCounts = { total: 0, active: 0, inTransition: 0, completed: 0, cancelled: 0 };

  for (const [label, count] of Object.entries(stageCounts ?? {})) {
    counts.total += count;
    const meta = byLabel.get(label.toLowerCase());
    if (!meta) continue;
    switch (archetypeOf(meta)) {
      case 'Active': counts.active += count; break;
      case 'In Transition': counts.inTransition += count; break;
      case 'Completed': counts.completed += count; break;
      case 'Rejected': counts.cancelled += count; break;
    }
  }

  return counts;
}

/**
 * Status metadata rendered as filter-dropdown options, ordered by pipeline
 * sequence so the list reads in the order an application actually travels.
 *
 * Shares `StageFilterOption` with `toStageFilterOptions` so a dropdown can be
 * fed from either source — the seller stage list inside the bank portals, this
 * one everywhere else.
 */
export function toStatusFilterOptions(statuses: readonly LoanStatusMeta[]): StageFilterOption[] {
  return [...statuses]
    .sort(compareStageSequence)
    .map((meta) => {
      const style = getStageStyle(meta.status);
      return {
        value: meta.status,
        label: meta.status,
        color: style.color,
        dot: style.dot,
        archetype_state: archetypeOf(meta),
        ...(meta.sequence !== null && meta.sequence !== undefined ? { sequence: meta.sequence } : {}),
        ...(meta.stage_id ? { stage_id: meta.stage_id } : {}),
      };
    });
}

/**
 * Adapts caller-scoped status metadata into the `LoanStage` shape the badge and
 * filter helpers already speak, so one set of components can be driven from
 * either source.
 *
 * `application_count` is 0 because `get_loan_metadata` carries no counts — it
 * describes the pipeline, not its contents. Callers that need per-stage figures
 * read them from `get_loan_summary().stages` instead.
 */
export function toPseudoStages(statuses: readonly LoanStatusMeta[]): LoanStage[] {
  return [...statuses]
    .sort(compareStageSequence)
    .map((meta) => ({
      name: meta.status,
      bank: '',
      stage_id: meta.stage_id ?? '',
      label: meta.status,
      archetype_state: archetypeOf(meta),
      sequence: meta.sequence ?? 0,
      application_count: 0,
    }));
}

/**
 * The inverse of `toPseudoStages`: a configured stage described as status
 * metadata, so the seller stage list and `get_loan_metadata` can feed the same
 * bucketing helper.
 *
 * A bank may only map a stage to `In Transition`, `Completed` or `Rejected`
 * (`add_stage` / `sync_stages` enforce that), so terminality is decidable from
 * `archetype_state` alone.
 */
export function stageToStatusMeta(stage: LoanStage): LoanStatusMeta {
  return {
    status: stage.label,
    stage_id: stage.stage_id,
    sequence: stage.sequence,
    is_terminal: stage.archetype_state === 'Completed' || stage.archetype_state === 'Rejected',
    is_successful: stage.archetype_state === 'Completed',
  };
}
