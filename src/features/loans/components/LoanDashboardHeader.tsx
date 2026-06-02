import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { DATE_RANGE_OPTIONS } from '../constants/loans.constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDateRange, setDateRange } from '../store/loanDashboardSlice';

const LoanDashboardHeader = React.memo(() => {
  const dispatch = useAppDispatch();
  const dateRange = useAppSelector(selectDateRange);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? 'Last 30 Days';

  return (
    <header className="flex items-center justify-end gap-3 mb-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className={`flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50 ${
            dropdownOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''
          }`}
        >
          {activeLabel}
          <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 w-48 overflow-hidden rounded-xl border border-border-subtle bg-white py-1 shadow-elevated">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  dispatch(setDateRange(opt.value));
                  setDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition hover:bg-slate-50 ${
                  dateRange === opt.value ? 'bg-blue-50/50 text-blue-600 font-medium' : 'text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50 active:scale-95"
      >
        <Download size={16} />
        Export CSV
      </button>
    </header>
  );
});

LoanDashboardHeader.displayName = 'LoanDashboardHeader';
export default LoanDashboardHeader;
