import { STATUS_CFG } from '../constants/loans.constants';

interface LoanStatusBadgeProps {
  status: string;
}

/**
 * Renders a colored status pill badge for a loan application status.
 */
function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  const cfg = STATUS_CFG[status] ?? {
    dot: 'bg-slate-400',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export default LoanStatusBadge;
