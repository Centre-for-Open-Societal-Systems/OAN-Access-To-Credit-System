import React from 'react';
import { Search, SlidersHorizontal, Activity } from 'lucide-react';

export default function LoanToolbar() {
  return (
    <div className="flex flex-col">
      {/* Recent Activity Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/70 text-blue-600 shadow-sm">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Recent Activity</h2>
        </div>

        <button
          type="button"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors focus:outline-none"
        >
          View All
        </button>
      </div>

      {/* Filter and Search controls */}
      {/* <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between bg-slate-50/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full rounded-xl border border-border-subtle bg-slate-50/50 py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div> */}

      {/* <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50 active:scale-95"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div> */}
    </div>
    // </div>
  );
}
