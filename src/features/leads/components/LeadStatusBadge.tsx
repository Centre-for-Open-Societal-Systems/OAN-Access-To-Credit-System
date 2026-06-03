
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

  return status;
};

const STATUS_STYLE_MAP: Record<string, { badgeClass: string; dotClass: string }> = {
  Active: {
    badgeClass: "bg-blue-50/70 border border-blue-200/50 text-[#3B82F6]",
    dotClass: "bg-[#3B82F6]"
  },
  Verified: {
    badgeClass: "bg-[rgba(50,164,127,0.1)] border border-[rgba(50,164,127,0.2)] text-[#32A47F]",
    dotClass: "bg-[#32A47F]"
  },
  Processed: {
    badgeClass: "bg-[#CCFBF1] border border-teal-200/30 text-[#115E59]",
    dotClass: "bg-[#0D9488]"
  },
  Rejected: {
    badgeClass: "bg-amber-50/70 border border-amber-200/50 text-[#F59E0B]",
    dotClass: "bg-[#F59E0B]"
  },
  Dormant: {
    badgeClass: "bg-indigo-50/70 border border-indigo-200/50 text-[#4F46E5]",
    dotClass: "bg-[#4F46E5]"
  }
};

function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const kpiLabel = mapStatusToKpiLabel(status);
  const cfg = STATUS_STYLE_MAP[kpiLabel] ?? {
    badgeClass: 'bg-slate-50 text-slate-600 border border-slate-200',
    dotClass: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold select-none ${cfg.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {kpiLabel}
    </span>
  );
}

export default LeadStatusBadge;
