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
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#F1F3F4] bg-white px-5 py-4 rounded-t-2xl">
        {/* Left side: Search input + Search button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:max-w-lg font-semibold">
          <div className="relative flex flex-1 items-center rounded-lg border border-[#EDEFF1] bg-[#F6F8FA] px-3 py-2.5">
            <Search size={18} className="absolute left-3 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by Lead ID or Phone Number..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearchSubmit(localSearch)}
              className="w-full bg-transparent pl-8 text-base text-[#232F34] placeholder-[#9CA3AF] font-normal focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => onSearchSubmit(localSearch)}
            className="flex sm:inline-flex items-center justify-center rounded-lg bg-[#16A34A] px-6 py-2.5 text-base font-semibold text-white transition hover:bg-[#10883c] active:scale-95 shrink-0"
          >
            Search
          </button>
        </div>

        {/* Right side: Advanced Filters + Clear Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 justify-between w-full md:w-auto font-bold">
          <button
            type="button"
            onClick={onShowAdvFilters}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-base font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95 whitespace-nowrap"
          >
            <SlidersHorizontal size={18} className="text-[#6B7280]" />
            Advanced Filters
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-base font-semibold text-[#16A34A] transition hover:text-[#10883c] whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* tabs row */}
      <div className="flex items-center gap-8 px-8 pt-5 bg-white overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-bold border-b border-gray-200">
        {tabs.map(t => {
          const isActive = activeTab === t.key;
          const formattedCount = t.count >= 1000
            ? (t.count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
            : t.count > 0 ? t.count.toString() : '—';

          const tabClass = isActive
            ? "relative pb-4 text-base font-semibold text-emerald-600 transition-colors"
            : "relative pb-4 text-base font-medium text-gray-400 hover:text-gray-600 transition-colors";

          const badgeClass = isActive
            ? "ml-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm text-emerald-700"
            : "ml-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-500";

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={tabClass}
            >
              {t.label} <span className={badgeClass}>{formattedCount}</span>
              {isActive && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500 rounded-t-md " />}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default LeadToolbar;
