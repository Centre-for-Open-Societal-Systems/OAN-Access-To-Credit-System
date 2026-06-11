import { STATUS_CFG } from '../constants/leads.constants';

interface LeadStatusBadgeProps {
  status: string;
}

const mapStatusToKpiLabel = (status?: string): string => {
  if (!status) return 'Active';
  const lower = status.toLowerCase();

  if (lower === 'initiated' || lower === 'open' || lower === 'active') return 'Active';
  if (lower === 'qualified' || lower === 'verified') return 'Verified';
  if (lower === 'processed') return 'Processed';
  if (lower === 'granted') return 'Granted';
  if (lower === 'rejected' || lower === 'not interested' || lower === 'not_interested') return 'Rejected';
  if (lower === 'dormant' || lower === 'disqualified' || lower === 'invalid') return 'Dormant';

  // Capitalize fallback
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const normalized = mapStatusToKpiLabel(status);
  const cfg = STATUS_CFG[normalized] ?? {
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <div className={`flex flex-row items-center px-2 py-0.5 gap-[6px] w-fit rounded-full border ${cfg.badge}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className="font-roboto font-medium text-xs leading-[18px]">
        {normalized}
      </span>
    </div>
  );
}

export default LeadStatusBadge;
