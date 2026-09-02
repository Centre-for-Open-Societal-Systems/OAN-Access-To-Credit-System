import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const PAGE_SIZE_OPTIONS = [10, 20, 100] as const;

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  visibleCount: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  totalEntries,
  visibleCount,
  entriesPerPage,
  onPageChange,
  onPageSizeChange,
}: CatalogPaginationProps) {
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

  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }
  }

  return (
    <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-[#F1F3F4] rounded-xl mt-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      {/* Left Group: Dropdown and Info */}
      <div className="flex flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
        {/* Dropdown (Now on the left side) */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <span className="text-sm text-gray-500">Show</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 bg-white shadow-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all hover:bg-gray-50 active:scale-95"
            >
              {entriesPerPage}
              <svg
                className={`h-3.5 w-3.5 fill-current text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 bottom-[calc(100%+4px)] z-50 w-full min-w-[72px] rounded-md border border-gray-200 bg-white shadow-lg origin-bottom animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      onPageSizeChange(size);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-50 ${entriesPerPage === size ? 'text-[#16A34A] bg-green-50/50' : 'text-gray-700'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Text */}
        <div className="text-sm text-gray-500 shrink-0">
          <span className="font-medium text-gray-900">{visibleCount}</span> of{' '}
          <span className="font-medium text-gray-900">{totalEntries}</span> records
        </div>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-8 items-center justify-center px-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft size={16} className="mr-0.5" />
          Previous
        </button>

        {pages.map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="px-2 text-gray-400">...</span>
            ) : (
              <button
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page
                  ? 'bg-[#16A34A] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 items-center justify-center px-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Next
          <ChevronRight size={16} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}
