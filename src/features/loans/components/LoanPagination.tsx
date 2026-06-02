import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectActivityPage, selectTotalPages, setActivityPage } from '../store/loanDashboardSlice';

const LoanPagination = React.memo(() => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(selectActivityPage);
  const totalPages = useAppSelector(selectTotalPages);

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between border-t border-[#e9e9e9] bg-white px-4 py-4 sm:px-6">
      <div className="text-sm text-text-muted">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => dispatch(setActivityPage(currentPage - 1))}
          className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {pages.map((pg) => (
          <button
            key={pg}
            type="button"
            onClick={() => dispatch(setActivityPage(pg))}
            className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors ${
              pg === currentPage
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-[#e5e7eb] bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {pg}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => dispatch(setActivityPage(currentPage + 1))}
          className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
});

LoanPagination.displayName = 'LoanPagination';
export default LoanPagination;
