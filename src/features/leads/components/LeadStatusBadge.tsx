import { STATUS_STYLE_MAP } from '../constants/leads.constants';

interface LeadStatusBadgeProps {
  status: string;
}

const normalizeStatus = (status: string) => {
  if (!status) return 'Active';
  const lower = status.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
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
