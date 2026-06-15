import { cn } from '@/lib/utils';
import React from 'react';

import { STATUS_STYLE_MAP, type StatusStyle } from '@/features/leads/constants/leads.constants';

const BADGE_BASE = "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold select-none";
const DOT_BASE = "h-2 w-2 shrink-0 rounded-full";

const UNKNOWN_STYLE: StatusStyle = {
  badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
  dotClass: "bg-gray-400",
};

interface LeadStatusBadgeProps {
  readonly status: string;
}

const normalizeStatus = (status: string): string => {
  if (!status) return 'Unknown';
  const lower = status.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps): React.JSX.Element {
  const normalized = normalizeStatus(status);
  const style = STATUS_STYLE_MAP[normalized] ?? UNKNOWN_STYLE;

  return (
    <span className={cn(BADGE_BASE, style.badgeClass)}>
      <span className={cn(DOT_BASE, style.dotClass)} />
      {normalized}
    </span>
  );
}

