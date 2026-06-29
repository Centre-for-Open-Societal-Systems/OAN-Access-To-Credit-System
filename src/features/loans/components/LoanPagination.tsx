import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectActivityPage,
  selectTotalPages,
  setActivityPage,
  selectTotalCount,
  selectPageSize,
  setPageSize
} from '../store/loanDashboardSlice';

const LoanPagination = React.memo(() => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(selectActivityPage);
  const totalPages = useAppSelector(selectTotalPages);
  const totalCount = useAppSelector(selectTotalCount);
  const pageSize = useAppSelector(selectPageSize);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (totalPages <= 1 && totalCount <= pageSize) return null;

  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center xl:justify-between gap-4 md:gap-6 border-t border-gray-100 bg-white px-4 sm:px-8 py-5">
      <div className="text-sm sm:text-base text-gray-400 font-medium flex flex-wrap items-center justify-center shrink-0 text-center">
        <span className="whitespace-nowrap">Showing</span>
        <div className="mx-2 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 rounded border border-gray-200 px-4 py-1.5 text-gray-700 bg-white shadow-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all hover:bg-gray-50 active:scale-95"
          >
            {pageSize}
            <svg className={`h-4 w-4 fill-current text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute left-0 bottom-[calc(100%+4px)] z-50 w-full min-w-[80px] rounded-md border border-gray-200 bg-white shadow-lg origin-bottom animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
              {[10, 20, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    dispatch(setPageSize(size));
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${pageSize === size ? 'text-[#16A34A] bg-green-50/50' : 'text-gray-700'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="whitespace-nowrap">of {totalCount.toLocaleString()} entries</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full xl:w-auto">
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
