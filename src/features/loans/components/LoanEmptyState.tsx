import { X, SearchX, Users } from 'lucide-react';

interface LoanEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

function LoanEmptyState({ hasFilters, onClearFilters }: LoanEmptyStateProps) {
  return (
    <tr>
      <td colSpan={8}>
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-slate-100 animate-ping opacity-30" style={{ animationDuration: '2.4s' }} />
            <span className="absolute inset-3 rounded-full bg-slate-100 animate-ping opacity-25" style={{ animationDuration: '2.4s', animationDelay: '0.4s' }} />
            <span className="absolute inset-6 rounded-full bg-slate-100 animate-ping opacity-20" style={{ animationDuration: '2.4s', animationDelay: '0.8s' }} />
            <div
              className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md border border-slate-100"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            >
              <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
              {hasFilters
                ? <SearchX size={36} className="text-slate-400" strokeWidth={1.5} />
                : <Users   size={36} className="text-slate-400" strokeWidth={1.5} />
              }
            </div>
          </div>
          <div className="space-y-1.5 text-center">
            <h3 className="text-lg font-semibold text-[#232F34]">
              {hasFilters ? 'No loans match your filters' : 'No loans yet'}
            </h3>
            <p className="mx-auto max-w-xs text-sm text-[#AEB4BA] leading-relaxed">
              {hasFilters
                ? 'Try adjusting or clearing your active filters to see more results.'
                : 'Create your first loan to get started with the pipeline.'
              }
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 150, 300].map(delay => (
              <span
                key={delay}
                className={`h-2 w-2 rounded-full animate-bounce ${
                  hasFilters ? 'bg-orange-300' : 'bg-slate-300'
                }`}
                style={{ animationDelay: `${delay}ms`, animationDuration: '1.2s' }}
              />
            ))}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-green-600 bg-white px-5 py-2.5 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50 active:scale-95"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default LoanEmptyState;
