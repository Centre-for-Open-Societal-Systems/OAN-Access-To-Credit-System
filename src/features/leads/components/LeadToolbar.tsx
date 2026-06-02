import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { DateSelect } from './LeadColFilterPopup';
import { DATE_OPTS } from '../constants/leads.constants';

interface LeadToolbarProps {
  search: string;
  activeTab: string;
  allLeadsCount: number;
  myLeadsCount: number;
  unassignedLeadsCount: number;
  dateFilter: string;
  onTabChange: (tab: string) => void;
  onDateChange: (date: string) => void;
  onShowAdvFilters: () => void;
  onClearFilters: () => void;
  onSearchSubmit: (search: string) => void;
}

function LeadToolbar({
  search,
  activeTab,
  allLeadsCount,
  myLeadsCount,
  unassignedLeadsCount,
  dateFilter,
  onTabChange,
  onDateChange,
  onShowAdvFilters,
  onClearFilters,
  onSearchSubmit,
}: LeadToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);
  const tabs = [
    { key: 'all',        label: 'All Leads',  count: allLeadsCount        },
    { key: 'my',         label: 'My Leads',   count: myLeadsCount         },
    { key: 'unassigned', label: 'Unassigned', count: unassignedLeadsCount },
  ];

  return (
    <>
      {/* search row */}
      <div className="relative flex flex-wrap items-center justify-between border-b border-[#F1F3F4] bg-white px-5 py-4 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-t-2xl">
        {/* Left side: Search input + Search button */}
        <div className="flex items-center gap-3 w-full max-w-lg">
          <div className="relative flex flex-1 items-center rounded-lg border border-[#EDEFF1] bg-[#F6F8FA] px-3 py-2.5">
            <Search size={16} className="absolute left-3 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by Lead ID or Phone Number..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearchSubmit(localSearch)}
              className="w-full bg-transparent pl-7 text-sm text-[#232F34] placeholder-[#9CA3AF] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => onSearchSubmit(localSearch)}
            className="flex items-center justify-center rounded-lg bg-[#232F34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C262A] active:scale-95 h-[42px]"
          >
            Search
          </button>
        </div>

        {/* Right side: Advanced Filters + Clear Filters */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onShowAdvFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-[#EDEFF1] bg-white px-4 py-2.5 text-sm font-medium text-[#6B7280] transition hover:bg-slate-50 active:scale-95 h-[42px]"
          >
            <SlidersHorizontal size={14} className="text-[#6B7280]" />
            Advanced Filters
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-semibold text-[#0D9488] transition hover:text-[#0b7e74] active:scale-95"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* tabs + date filter row */}
      <div className="flex items-center justify-between border-b border-border-subtle px-5">
        <div className="flex items-center gap-6">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`flex items-center gap-2 border-b-2 py-4 text-base font-medium transition ${
                activeTab === t.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
                activeTab === t.key ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-text-muted'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 py-3">
          <span className="text-base font-medium text-text-muted">Date&nbsp;</span>
          <DateSelect
            value={dateFilter}
            options={DATE_OPTS}
            onChange={onDateChange}
          />
        </div>
      </div>
    </>
  );
}

export default LeadToolbar;
