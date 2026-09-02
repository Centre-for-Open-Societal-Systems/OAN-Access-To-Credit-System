import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export interface TablePaginationProps {
  /** Rows rendered on the current page. */
  visibleCount: number;
  /** Rows matching the current filters, across all pages. */
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Page numbers to render, with an ellipsis wherever the run is broken.
 *
 * Always shows the first and last page plus a window around the current one.
 * This bar used to render pages 1-3 and the last page unconditionally, so on a
 * 40-page list sitting on page 7 there was no button for the page you were on,
 * and no way to step to page 8 other than Next.
 */
function pageItems(currentPage: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'gap', totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, 'gap', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'gap', currentPage - 1, currentPage, currentPage + 1, 'gap', totalPages];
}

/**
 * Footer bar for every dashboard table — record count, page-size dropdown and
 * page navigation.
 *
 * Each table used to carry its own copy. They had drifted on the record-count
 * wording ("records" / "Applications" / "entries"), on button shape, on how many
 * page numbers they offered, and on whether the bar hid itself when empty — so
 * four screens showing the same kind of list each ended the list differently.
 * This is the props-driven one; store-connected callers wrap it (see
 * features/loans/components/LoanPagination.tsx).
 */
export function TablePagination({
  visibleCount,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
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

  // Guard removed: the footer must always render so the page-size dropdown remains accessible.

  // A list that has loaded nothing still has a page 1; without the floor, Next
  // stays enabled against totalPages === 0.
  const lastPage = Math.max(1, totalPages);
  const pages = pageItems(currentPage, lastPage);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 border-t border-[#F1F3F4] bg-white px-4 sm:px-8 py-5">
      {/* Left: record count & page size dropdown */}
      <div className="text-sm sm:text-base text-gray-400 font-medium flex flex-wrap items-center justify-center shrink-0 gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 rounded border border-gray-200 px-4 py-1.5 text-gray-700 bg-white shadow-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all hover:bg-gray-50 active:scale-95 text-sm sm:text-base"
          >
            {pageSize}
            <svg className={`h-4 w-4 fill-current text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 bottom-[calc(100%+4px)] z-50 w-full min-w-[80px] rounded-md border border-gray-200 bg-white shadow-lg origin-bottom animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    onPageSizeChange(size);
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
        <span className="whitespace-nowrap">
          Showing <span className="font-semibold text-gray-700">{visibleCount}</span> of{' '}
          <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span> records
        </span>
      </div>

      {/* Right: page navigation */}
      <div className="flex flex-nowrap items-center justify-center md:justify-end gap-1.5 sm:gap-2 w-full md:w-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-3 text-base font-semibold text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={18} className="mr-1" />
          Prev
        </button>

        {pages.map((pg, index) => (
          pg === 'gap' ? (
            <span key={`gap-${index}`} className="mx-1 text-gray-400" aria-hidden="true">…</span>
          ) : (
            <button
              key={pg}
              type="button"
              onClick={() => onPageChange(pg)}
              aria-current={currentPage === pg ? 'page' : undefined}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-base font-semibold transition-colors ${currentPage === pg
                ? 'bg-[#16A34A] text-white shadow-sm'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
            >
              {pg}
            </button>
          )
        ))}

        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          className="inline-flex h-10 items-center justify-center rounded-md bg-white px-3 text-base font-semibold text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          Next
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
}

export default TablePagination;
