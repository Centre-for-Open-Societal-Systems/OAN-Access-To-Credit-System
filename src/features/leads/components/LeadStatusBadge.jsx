import { STATUS_CFG } from '../constants/leads.constants.js';

function LeadStatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${cfg.badge}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

export default LeadStatusBadge;
