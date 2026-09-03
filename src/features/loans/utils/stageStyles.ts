import type { LoanStage, StageFilterOption, StageStyle } from '../types/loanStages.types';

// The palette, named once. These were repeated as object literals at each branch
// below, which is how the same state ended up with two different greens.
const SUCCESS_STYLE: StageStyle = {
  badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  dot: 'bg-emerald-500',
  color: 'bg-emerald-500',
  tone: 'success',
};

const DANGER_STYLE: StageStyle = {
  badge: 'bg-red-50 text-red-700 border border-red-200',
  dot: 'bg-red-500',
  color: 'bg-red-500',
  tone: 'danger',
};

const NEUTRAL_STYLE: StageStyle = {
  badge: 'bg-gray-50 text-gray-600 border border-gray-200',
  dot: 'bg-gray-400',
  color: 'bg-gray-400',
  tone: 'neutral',
};

const SUBMITTED_STYLE: StageStyle = {
  badge: 'bg-blue-50 text-blue-700 border border-blue-200',
  dot: 'bg-blue-500',
  color: 'bg-blue-500',
  tone: 'info',
};

const VERIFICATION_STYLE: StageStyle = {
  badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  dot: 'bg-indigo-500',
  color: 'bg-indigo-500',
  tone: 'info',
};

const DEFAULT_STYLE: StageStyle = {
  badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  dot: 'bg-cyan-500',
  color: 'bg-cyan-500',
  tone: 'info',
};

/**
 * Archetypes whose outcome is already decided.
 *
 * These outrank the stage's label: a bank is free to call a stage whatever it
 * likes, so a stage labelled "Approved" that sits in the `Rejected` archetype
 * must render red. The label describes the step; the archetype describes what
 * actually happened, and only the archetype is a platform constant.
 */
const TERMINAL_ARCHETYPE_STYLES: Record<string, StageStyle> = {
  Completed: SUCCESS_STYLE,
  Rejected: DANGER_STYLE,
  // Deliberately the same red as Rejected, and deliberately a separate key:
  // nothing can currently transition into Cancelled, but the vocabulary is
  // complete so a stage that reaches it is not styled by accident.
  Cancelled: DANGER_STYLE,
};

/**
 * Archetypes an application is still moving through.
 *
 * These are the *fallback*, applied only after the stage's own label has had a
 * chance to colour it — a bank defines every one of its pipeline steps inside
 * `In Transition`, so mapping the archetype ahead of the label would flatten
 * Submitted, Processed, Verified and Approved into one indistinguishable colour.
 *
 * `Active` is what `create_loan_application` stamps: created, but not yet in any
 * bank's pipeline. Neutral rather than the `In Transition` cyan, because nobody
 * has acted on it yet and it should not read as work in progress.
 */
const PROGRESS_ARCHETYPE_STYLES: Record<string, StageStyle> = {
  Active: NEUTRAL_STYLE,
  'In Transition': DEFAULT_STYLE,
};

/**
 * Every archetype state the backend defines, in one map.
 *
 * Mirrors `ARCHETYPE_STATES` in `oan_a2c/a2c_marketplace/stages.py`. `Active` and
 * `In Transition` were missing here, so the two states most rows actually carry
 * fell through to the generic default — the same colour an unrecognised stage
 * gets, which made "nobody has looked at this yet" and "we don't know what this
 * is" indistinguishable.
 *
 * Note there is no `Draft`: it is a status on the application document, not an
 * archetype, and no stage ever carries it. The keyword fallback below still
 * handles it for the raw-string case.
 */
const ARCHETYPE_STYLES: Record<string, StageStyle> = {
  ...TERMINAL_ARCHETYPE_STYLES,
  ...PROGRESS_ARCHETYPE_STYLES,
};

/**
 * Returns a consistent visual style for any stage or status.
 * Intelligently checks against dynamic stages first (matching stage_id, label, name, or external_code),
 * then falls back to archetype_state or keyword matching.
 */
export function getStageStyle(
  statusOrStage: string | LoanStage,
  stages?: readonly LoanStage[]
): StageStyle & { label: string } {
  if (typeof statusOrStage === 'object' && statusOrStage !== null) {
    const stage = statusOrStage;
    return {
      ...getStyleForStage(stage),
      label: stage.label,
    };
  }

  const rawStatus = statusOrStage || '';

  // Look up in provided dynamic stages if available
  if (stages && stages.length > 0) {
    const matched = stages.find(
      (s) =>
        s.label.toLowerCase() === rawStatus.toLowerCase() ||
        s.stage_id.toLowerCase() === rawStatus.toLowerCase() ||
        s.name?.toLowerCase() === rawStatus.toLowerCase() ||
        (s.external_code && s.external_code.toLowerCase() === rawStatus.toLowerCase())
    );

    if (matched) {
      return {
        ...getStyleForStage(matched),
        label: matched.label,
      };
    }
  }

  // An archetype name on its own. Unlike a stage, it carries no bank label to
  // refine it, so the archetype's own style is the answer and the keyword pass
  // below has nothing to add — 'Active' and 'In Transition' match none of its
  // keywords and used to fall all the way through to the default.
  const archetypeStyle = ARCHETYPE_STYLES[rawStatus];
  if (archetypeStyle) {
    return { ...archetypeStyle, label: rawStatus };
  }

  // Fallback keyword-based matching
  const lower = rawStatus.toLowerCase();
  if (lower.includes('disburs') || lower.includes('complet') || lower.includes('approv') || lower.includes('grant')) {
    return { ...SUCCESS_STYLE, label: rawStatus };
  }
  if (lower.includes('reject') || lower.includes('declin') || lower.includes('cancel')) {
    return { ...DANGER_STYLE, label: rawStatus };
  }
  if (lower.includes('draft') || lower.includes('pending')) {
    return { ...NEUTRAL_STYLE, label: rawStatus };
  }
  if (lower.includes('submit')) {
    return { ...SUBMITTED_STYLE, label: rawStatus };
  }
  if (lower.includes('verif') || lower.includes('doc')) {
    return { ...VERIFICATION_STYLE, label: rawStatus };
  }

  return { ...DEFAULT_STYLE, label: rawStatus || 'Unknown' };
}

function getStyleForStage(stage: LoanStage): StageStyle {
  const archetype = stage.archetype_state;

  // Decided outcomes win outright — see TERMINAL_ARCHETYPE_STYLES.
  if (archetype && TERMINAL_ARCHETYPE_STYLES[archetype]) {
    return TERMINAL_ARCHETYPE_STYLES[archetype]!;
  }

  // Specific transition nuances based on sequence or label
  const labelLower = stage.label.toLowerCase();
  if (labelLower.includes('submit')) {
    return SUBMITTED_STYLE;
  }
  if (labelLower.includes('verif') || labelLower.includes('kyc')) {
    return VERIFICATION_STYLE;
  }
  if (labelLower.includes('approv') || labelLower.includes('sanction')) {
    return SUCCESS_STYLE;
  }
  if (labelLower.includes('reject')) {
    return DANGER_STYLE;
  }

  // No label nuance matched, so fall back to what the archetype says the stage is.
  if (archetype && PROGRESS_ARCHETYPE_STYLES[archetype]) {
    return PROGRESS_ARCHETYPE_STYLES[archetype]!;
  }

  return DEFAULT_STYLE;
}

/**
 * Maps an array of LoanStage items returned from the backend into options
 * formatted for Advanced Filters and Table Status dropdowns.
 */
export function toStageFilterOptions(stages: readonly LoanStage[]): StageFilterOption[] {
  return stages.map((stage) => {
    const style = getStageStyle(stage);
    return {
      value: stage.label,
      label: stage.label,
      color: style.color,
      dot: style.dot,
      archetype_state: stage.archetype_state,
      sequence: stage.sequence,
      stage_id: stage.stage_id,
      application_count: stage.application_count,
    };
  });
}

/**
 * Stable comparator to sort pipeline stages or metadata by their configured sequence.
 */
export function compareStageSequence(
  a: { sequence?: number | null | undefined },
  b: { sequence?: number | null | undefined }
): number {
  return (a.sequence ?? Number.MAX_SAFE_INTEGER) - (b.sequence ?? Number.MAX_SAFE_INTEGER);
}

export interface StageKpiCard {
  key: string;
  label: string;
  archetype: string;
  value: number;
}

/**
 * Builds KPI cards for loan pipeline stages by joining configured stages with live summary counts.
 * Handles key deduplication and orders cards strictly by pipeline sequence.
 */
export function buildStageKpiCards(
  stages: readonly LoanStage[],
  counts?: Record<string, number> | undefined
): StageKpiCard[] {
  const countsMap = counts ?? {};
  const byLabel = new Map(
    Object.entries(countsMap).map(([label, count]) => [label.toLowerCase(), count])
  );
  const seenKeys = new Map<string, number>();

  return [...stages]
    .sort(compareStageSequence)
    .map((stage, index) => {
      const rawKey = stage.stage_id || stage.name || stage.label || `stage-${index}`;
      const occurrence = seenKeys.get(rawKey) ?? 0;
      seenKeys.set(rawKey, occurrence + 1);
      const key = occurrence === 0 ? rawKey : `${rawKey}-${occurrence}`;

      return {
        key,
        label: stage.label,
        archetype: stage.archetype_state,
        value:
          byLabel.get(stage.label.toLowerCase()) ??
          (stage.stage_id ? byLabel.get(stage.stage_id.toLowerCase()) : undefined) ??
          0,
      };
    });
}

