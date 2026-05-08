import { ChevronLeft, ChevronRight } from 'lucide-react';

function LeadPagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-sm sm:flex-row sm:justify-between">
      <p className="text-xs text-text-muted">
        Showing <span className="font-semibold text-text-primary">{startItem}–{endItem}</span> of{' '}
        <span className="font-semibold text-text-primary">{totalItems}</span> leads
      </p>

      <div className="flex items-center gap-1.5">
        <button
          className="grid h-8 w-8 place-items-center rounded-xl border border-border-subtle bg-page text-text-muted transition hover:border-slate-300 hover:bg-white hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          type="button"
          aria-label="Previous page"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={14} strokeWidth={2.4} aria-hidden="true" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`grid h-8 min-w-[2rem] place-items-center rounded-xl border px-2 text-xs font-semibold transition ${
              page === currentPage
                ? 'border-button bg-button text-white shadow-sm'
                : 'border-border-subtle bg-page text-text-muted hover:border-slate-300 hover:bg-white hover:text-text-primary'
            }`}
            type="button"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="grid h-8 w-8 place-items-center rounded-xl border border-border-subtle bg-page text-text-muted transition hover:border-slate-300 hover:bg-white hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          type="button"
          aria-label="Next page"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={14} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default LeadPagination;
