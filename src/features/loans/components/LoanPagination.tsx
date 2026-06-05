import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectActivityPage,
  selectTotalPages,
  setActivityPage,
  selectTotalCount,
  selectPagedRows,
  selectPageSize,
  setPageSize
} from '../store/loanDashboardSlice';

const LoanPagination = React.memo(() => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(selectActivityPage);
  const totalPages = useAppSelector(selectTotalPages);
  const totalCount = useAppSelector(selectTotalCount);
  const pagedRows = useAppSelector(selectPagedRows);
  const pageSize = useAppSelector(selectPageSize);

  if (totalPages <= 1 && totalCount <= pageSize) return null;

  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-white px-4 sm:px-8 py-5">
      <div className="text-sm sm:text-base text-gray-400 font-medium flex items-center shrink-0">
        <span className="whitespace-nowrap">Showing</span>
        <div className="mx-2 relative">
          <select
            value={pageSize}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className="appearance-none flex items-center justify-center rounded border border-gray-200 px-4 py-1.5 pr-8 text-gray-700 bg-white shadow-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
          </div>
        </div>
        <span className="whitespace-nowrap">of {totalCount.toLocaleString()} entries</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => dispatch(setActivityPage(currentPage - 1))}
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-3 text-base font-semibold text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={18} className="mr-1" />
          Prev
        </button>

        {pages.map((pg) => (
          <button
            key={pg}
            type="button"
            onClick={() => dispatch(setActivityPage(pg))}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-base font-semibold transition-colors ${pg === currentPage
              ? 'bg-[#16A34A] text-white shadow-sm'
              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
          >
            {pg}
          </button>
        ))}

        {totalPages > 3 && (
          <>
            <span className="text-gray-400 mx-1">...</span>
            <button
              type="button"
              onClick={() => dispatch(setActivityPage(totalPages))}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-base font-semibold transition-colors ${totalPages === currentPage
                ? 'bg-[#16A34A] text-white shadow-sm'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => dispatch(setActivityPage(currentPage + 1))}
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-3 text-base font-semibold text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          Next
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
});

LoanPagination.displayName = 'LoanPagination';
export default LoanPagination;
