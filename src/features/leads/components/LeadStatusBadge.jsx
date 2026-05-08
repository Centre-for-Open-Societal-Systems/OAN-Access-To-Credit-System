const STATUS_STYLES = {
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
};

function LeadStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
    >
      {status}
    </span>
  );
}

export default LeadStatusBadge;
