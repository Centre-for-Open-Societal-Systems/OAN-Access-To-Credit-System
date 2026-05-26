import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { DateSelect } from './LeadColFilterPopup';
import { DATE_OPTS } from '../constants/leads.constants';

interface LeadToolbarProps {
  search: string;
  activeTab: string;
  allLeadsCount: number;
  myLeadsCount: number;
  unassignedLeadsCount: number;
  dateFilter: string;
  onSearchChange: (search: string) => void;
  onTabChange: (tab: string) => void;
  onDateChange: (date: string) => void;
  onShowAdvFilters: () => void;
  onClearFilters: () => void;
}

function LeadToolbar({
  search,
  activeTab,
  allLeadsCount,
  myLeadsCount,
  unassignedLeadsCount,
  dateFilter,
  onSearchChange,
  onTabChange,
  onDateChange,
  onShowAdvFilters,
  onClearFilters,
}: LeadToolbarProps) {
  const tabs = [
    { key: 'all',        label: 'All Leads',  count: allLeadsCount        },
    { key: 'my',         label: 'My Leads',   count: myLeadsCount         },
    { key: 'unassigned', label: 'Unassigned', count: unassignedLeadsCount },
  ];

  return (
    <>
      {/* search row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-[#f4f4f4] px-4 py-2.5">
          <Search size={18} className="shrink-0 text-text-muted" />
          <input
            type="text"
            placeholder="Search by Lead ID or Phone Number..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="rounded-xl bg-[#16A34A] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#10883c] active:scale-95"
        >
          Search
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#16A34A] bg-[#EDFAF2] px-4 py-2 text-sm font-semibold text-[#16A34A] transition hover:bg-[#d6f5e5]"
        >
          <ChevronDown size={14} strokeWidth={2.5} />
          All Active (12k)
        </button>
        <button
          type="button"
          onClick={onShowAdvFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={16} />
          Advanced Filters
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-semibold text-[#16A34A] transition hover:text-[#10883c]"
        >
          Clear Filters
        </button>
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
