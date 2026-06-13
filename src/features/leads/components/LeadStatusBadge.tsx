import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import React from 'react';

type LeadStatus = 'Active' | 'Verified' | 'Processed' | 'Granted' | 'Rejected' | 'Dormant' | 'Unknown';

interface LeadStatusBadgeProps {
  readonly status: string;
}

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold select-none",
  {
    variants: {
      status: {
        Active: "bg-green-50 text-green-600 border border-green-200",
        Verified: "bg-teal-50 text-teal-600 border border-teal-200",
        Processed: "bg-cyan-50 text-cyan-600 border border-cyan-200",
        Granted: "bg-emerald-50 text-emerald-600 border border-emerald-200",
        Rejected: "bg-red-50 text-red-500 border border-red-200",
        Dormant: "bg-orange-50 text-orange-500 border border-orange-200",
        Unknown: "bg-gray-100 text-gray-600 border border-gray-200",
      },
    },
    defaultVariants: {
      status: "Unknown",
    },
  }
);

const dotVariants = cva(
  "h-2 w-2 shrink-0 rounded-full",
  {
    variants: {
      status: {
        Active: "bg-green-500",
        Verified: "bg-teal-500",
        Processed: "bg-cyan-500",
        Granted: "bg-emerald-500",
        Rejected: "bg-red-500",
        Dormant: "bg-orange-500",
        Unknown: "bg-gray-400",
      },
    },
    defaultVariants: {
      status: "Unknown",
    },
  }
);

const normalizeStatus = (status: string): LeadStatus => {
  if (!status) return 'Active';
  const lower = status.toLowerCase();
  const normalized = lower.charAt(0).toUpperCase() + lower.slice(1);
  
  const validStatuses: Omit<LeadStatus, 'Unknown'>[] = ['Active', 'Verified', 'Processed', 'Granted', 'Rejected', 'Dormant'];
  if ((validStatuses as string[]).includes(normalized)) {
    return normalized as LeadStatus;
  }
  return 'Unknown';
};

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps): React.JSX.Element {
  const kpiLabel = normalizeStatus(status);
  
  // Keep the original status casing for display purposes (fallback defaults to 'Active')
  const displayLabel = status 
    ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) 
    : 'Active';

  return (
    <span className={cn(badgeVariants({ status: kpiLabel }))}>
      <span className={cn(dotVariants({ status: kpiLabel }))} />
      {displayLabel}
    </span>
  );
}

