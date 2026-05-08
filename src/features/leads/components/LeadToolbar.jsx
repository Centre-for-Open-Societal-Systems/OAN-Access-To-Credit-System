import { Search, SlidersHorizontal } from 'lucide-react';

function LeadToolbar({
  searchValue,
  statusValue,
  statusOptions = [],
  resultCount,
  totalCount,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
        <Search
          className="shrink-0 text-text-muted"
          size={15}
          strokeWidth={2.3}
          aria-hidden="true"
        />
        <input
          className="w-full border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          type="search"
          placeholder="Search leads..."
          value={searchValue}
          aria-label="Search leads"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-page px-3 py-2">
          <SlidersHorizontal
            className="shrink-0 text-text-muted"
            size={13}
            strokeWidth={2.3}
            aria-hidden="true"
          />
          <select
            className="border-0 bg-transparent text-xs font-semibold text-text-primary outline-none"
            value={statusValue}
            aria-label="Filter by status"
            onChange={(event) => onStatusChange(event.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {statusValue !== 'all' || searchValue.trim() ? (
          <span className="inline-flex items-center rounded-full border border-border-subtle bg-page px-2.5 py-1 text-xs font-semibold text-text-muted">
            {resultCount} / {totalCount}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border-subtle bg-page px-2.5 py-1 text-xs font-semibold text-text-muted">
            {totalCount} leads
          </span>
        )}
      </div>
    </div>
  );
}

export default LeadToolbar;
