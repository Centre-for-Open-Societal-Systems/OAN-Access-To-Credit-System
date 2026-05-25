import { ChevronLeft, ChevronRight } from 'lucide-react';

function LeadPagination({ visibleCount, filteredCount, safePage, totalPages, pageNums, onPageChange }) {
  return (
    <div className="flex items-center justify-between border-t border-border-subtle px-5 py-4">
      <p className="text-sm text-text-muted">
        Showing <span className="font-semibold">{visibleCount}</span>{' '}
        of <span className="font-semibold">{filteredCount}</span> entries
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm text-text-muted transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        {pageNums.map((p, i) =>
          p === '…' ? (
            <span key={`ell-${i}`} className="px-2 text-sm text-text-muted">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                safePage === p
                  ? 'bg-green-600 text-white'
                  : 'border border-border-subtle bg-white text-text-muted hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm text-text-muted transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default LeadPagination;
