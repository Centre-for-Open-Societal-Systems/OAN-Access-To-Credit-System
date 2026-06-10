import { STATUS_CFG } from '../constants/leads.constants';

interface LeadStatusBadgeProps {
  status: string;
}

// Ensure the first letter is capitalized to match the keys in STATUS_CFG
const normalizeStatus = (status: string) => {
  if (!status) return 'Active';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const normalized = normalizeStatus(status);
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
