import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectActiveTab, setActiveTab, setSearchQuery, selectSearchQuery, clearAdvancedFilters } from '../store/loanDashboardSlice';
import LoanAdvancedFilters from './LoanAdvancedFilters';

export default function LoanToolbar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const currentSearch = useAppSelector(selectSearchQuery);
  const [localSearch, setLocalSearch] = useState(currentSearch);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = () => {
    dispatch(setSearchQuery(localSearch));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTabClass = (tabId: string) => {
    return activeTab === tabId
      ? "relative pb-4 text-base font-semibold text-emerald-600 transition-colors"
      : "relative pb-4 text-base font-medium text-gray-400 hover:text-gray-600 transition-colors";
  };

  const getBadgeClass = (tabId: string) => {
    return activeTab === tabId
      ? "ml-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm text-emerald-700"
      : "ml-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-500";
  };

  return (
    <div className="flex flex-col border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 font-semibold min-w-[280px]">
          <div className="relative flex items-center w-full sm:max-w-[450px] rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by Lead ID, Name, or Phone Number..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ml-3 w-full bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto rounded-lg bg-[#16A34A] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-5 justify-between w-full md:w-auto mt-2 md:mt-0 font-bold">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-base font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95"
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filters</span>
          </button>
          <button
            onClick={() => dispatch(clearAdvancedFilters())}
            className="text-base font-semibold text-emerald-600 transition hover:text-emerald-700 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8 px-8 pt-5 bg-white overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-bold">
        <button
          className={getTabClass('all')}
          onClick={() => dispatch(setActiveTab('all'))}
        >
          All Applications <span className={getBadgeClass('all')}>151</span>
          {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500 rounded-t-md " />}
        </button>

        <button
          className={getTabClass('my')}
          onClick={() => dispatch(setActiveTab('my'))}
        >
          My Applications <span className={getBadgeClass('my')}>12</span>
          {activeTab === 'my' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500 rounded-t-md" />}
        </button>

        <button
          className={getTabClass('unassigned')}
          onClick={() => dispatch(setActiveTab('unassigned'))}
        >
          Unassigned <span className={getBadgeClass('unassigned')}>15</span>
          {activeTab === 'unassigned' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-500 rounded-t-md" />}
        </button>
      </div>

      <LoanAdvancedFilters
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
