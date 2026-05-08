import { SearchX } from 'lucide-react';

function LeadEmptyState({ title, description, onResetFilters, onAddLead }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border-subtle bg-surface px-6 py-16 text-center shadow-sm">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border-subtle bg-page text-text-muted">
        <SearchX size={24} strokeWidth={1.8} aria-hidden="true" />
      </span>

      <div className="max-w-xs">
        <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-page px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:border-slate-300 hover:bg-white hover:text-text-primary"
          type="button"
          onClick={onResetFilters}
        >
          Reset filters
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-button px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-button-hover"
          type="button"
          onClick={onAddLead}
        >
          Add Lead
        </button>
      </div>
    </div>
  );
}

export default LeadEmptyState;
