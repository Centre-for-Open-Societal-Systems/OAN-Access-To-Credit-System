import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface LeadToolbarProps {
  search: string;
  activeTab: string;
  allLeadsCount: number;
  myLeadsCount: number;
  unassignedLeadsCount: number;
  onTabChange: (tab: string) => void;
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
  onTabChange,
  onShowAdvFilters,
  onClearFilters,
  onSearchSubmit,
}: LeadToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);
  const tabs = [
    { key: 'all', label: 'All Leads', count: allLeadsCount },
    { key: 'my', label: 'My Leads', count: myLeadsCount },
    { key: 'unassigned', label: 'Unassigned', count: unassignedLeadsCount },
  ];

  return (
    <>
      {/* search row */}
      <div className="relative flex flex-wrap items-center justify-between border-b border-[#F1F3F4] bg-white px-5 py-4 rounded-t-2xl">
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
      <div className="flex items-center justify-between border-b border-[#F1F3F4] bg-white px-2 h-[53px]">
        <div className="flex items-center h-full overflow-x-auto pb-0 [&::-webkit-scrollbar]:hidden">
          {tabs.map(t => {
            const isActive = activeTab === t.key;
            const formattedCount = t.count >= 1000
              ? (t.count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
              : t.count.toString();

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={`relative flex items-center gap-2 px-5 h-[44px] text-sm font-medium transition select-none outline-none ${isActive ? 'text-[#1E6865]' : 'text-[#C1C7D0] hover:text-[#9CA3AF]'
                  }`}
              >
                <span className="font-semibold">{t.label}</span>
                <span
                  className={`flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold h-[20px] transition ${isActive ? 'bg-[#F0FDFA] text-[#1E6865]' : 'bg-[#F1F3F4] text-[#9CA3AF]'
                    }`}
                >
                  {formattedCount}
                </span>

                {/* Active Underline Gradient */}
                <div
                  className={`absolute left-0 right-0 bottom-0 h-[3px] rounded-[3px] bg-gradient-to-r from-[rgba(20,184,166,0.2)] via-[rgba(20,184,166,0.8)] to-[rgba(20,184,166,0.2)] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default LeadToolbar;
