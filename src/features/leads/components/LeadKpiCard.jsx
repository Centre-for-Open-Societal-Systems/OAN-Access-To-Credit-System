const ICON_STYLES = {
  slate: 'bg-slate-900 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  rose: 'bg-rose-500 text-white',
};

function LeadKpiCard({ label, value, helper, icon: Icon, tone = 'slate' }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-page p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
          {label}
        </span>
        <span
          className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl ${ICON_STYLES[tone] ?? ICON_STYLES.slate}`}
        >
          <Icon size={15} strokeWidth={2.3} aria-hidden="true" />
        </span>
      </div>

      <div>
        <p className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-text-muted">{helper}</p>
      </div>
    </article>
  );
}

export default LeadKpiCard;
