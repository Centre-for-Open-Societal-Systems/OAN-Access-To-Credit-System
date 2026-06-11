import { STATUS_CFG } from '../constants/leads.constants';

interface LeadStatusBadgeProps {
  status: string;
}

const normalizeStatus = (status: string) => {
  if (!status) return 'Active';
  const lower = status.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const STATUS_STYLE_MAP: Record<string, { badgeClass: string; dotClass: string }> = {
  Active: {
    badgeClass: "bg-green-50 text-green-600 border border-green-200",
    dotClass: "bg-green-500"
  },
  Verified: {
    badgeClass: "bg-teal-50 text-teal-600 border border-teal-200",
    dotClass: "bg-teal-500"
  },
  Processed: {
    badgeClass: "bg-cyan-50 text-cyan-600 border border-cyan-200",
    dotClass: "bg-cyan-500"
  },
  Granted: {
    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dotClass: "bg-emerald-500"
  },
  Rejected: {
    badgeClass: "bg-red-50 text-red-500 border border-red-200",
    dotClass: "bg-red-500"
  },
  Dormant: {
    badgeClass: "bg-orange-50 text-orange-500 border border-orange-200",
    dotClass: "bg-orange-500"
  }
};

function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const kpiLabel = normalizeStatus(status);

  const displayLabel = kpiLabel;

  const cfg = STATUS_STYLE_MAP[kpiLabel] ?? {
    badgeClass: 'bg-gray-100 text-gray-600 border border-gray-200',
    dotClass: 'bg-gray-400'
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold select-none ${cfg.badgeClass}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dotClass}`} />
      {displayLabel}
    </span>
  );
}

export default LeadStatusBadge;
