'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus } from 'lucide-react';

import { PAGE_SIZE, KPI_CARDS_LAYOUT, resolveDateFilter } from '@/features/leads/constants/leads.constants';

import LeadKpiCard from '@/features/leads/components/LeadKpiCard';
import LeadToolbar from '@/features/leads/components/LeadToolbar';
import LeadTable from '@/features/leads/components/LeadTable';
import LeadPagination from '@/features/leads/components/LeadPagination';
import LeadAdvancedFilters from '@/features/leads/components/LeadAdvancedFilters';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLeads,
  fetchLeadSummary,
  selectLeads,
  selectIsLeadsLoading,
  selectLeadSummary,
  selectSearch,
  selectActiveTab,
  selectDateFilter,
  selectColStatusFilter,
  selectColCallTimeFilter,
  setSearch,
  setActiveTab,
  setDateFilter,
  setColStatusFilter,
  setColCallTimeFilter,
  resetFilters,
  selectTotalCount,
  selectAdvFilters,
} from '@/features/leads/store/leadSlice';

export default function LeadsDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const allLeads = useAppSelector(selectLeads) || [];
  const isLoading = useAppSelector(selectIsLeadsLoading);
  const leadSummary = useAppSelector(selectLeadSummary);
  const totalCount = useAppSelector(selectTotalCount);

  const search = useAppSelector(selectSearch);
  const activeTab = useAppSelector(selectActiveTab);
  const dateFilter = useAppSelector(selectDateFilter);
  const colStatusFilter = useAppSelector(selectColStatusFilter);
  const colCallTimeFilter = useAppSelector(selectColCallTimeFilter);
  const advFilters = useAppSelector(selectAdvFilters);

  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openColFilter, setOpenColFilter] = useState<string | null>(null);

  // Initial Summary Fetch
  React.useEffect(() => {
    dispatch(fetchLeadSummary());
  }, [dispatch]);

  // Load leads from backend
  const loadLeads = React.useCallback((page: number, currentSearch?: string) => {
    const assigned_to = activeTab === 'my' ? 'me' : activeTab === 'unassigned' ? 'unassigned' : undefined;

    let start_date = undefined;
    let end_date = undefined;

    // 1. Process Advanced Filters Date Range
    if (advFilters.dateFrom) start_date = advFilters.dateFrom;
    if (advFilters.dateTo) end_date = advFilters.dateTo;


    // 2. Resolve Quick Date / Toolbar Date Filter
    const activeDateFilter = advFilters.quickDate || (!start_date && dateFilter !== 'All Time' ? dateFilter : null);

    if (activeDateFilter) {
      const resolved = resolveDateFilter(activeDateFilter);
      if (resolved.start) start_date = resolved.start;
      if (resolved.end) end_date = resolved.end;
    }

    // Combine Statuses
    const allStatuses = Array.from(new Set([...colStatusFilter, ...advFilters.statuses]));
    const statusParam = allStatuses.length > 0 ? allStatuses.join(',') : undefined;

    // Combine Search
    let finalSearch = currentSearch ?? search;
    if (advFilters.phoneNumber.trim()) {
      finalSearch = finalSearch ? `${finalSearch} ${advFilters.phoneNumber.trim()}` : advFilters.phoneNumber.trim();
    }

    dispatch(fetchLeads({
      start: (page - 1) * PAGE_SIZE,
      page_length: PAGE_SIZE,
      search_query: finalSearch,
      status: statusParam,
      assigned_to,
      start_date,
      end_date
    }));
  }, [dispatch, activeTab, colStatusFilter, search, advFilters, dateFilter]);

  // Auto-fetch when filters/page change (except for search typing)
  React.useEffect(() => {
    loadLeads(currentPage);
  }, [loadLeads, currentPage]);


  const liveKpiStats = useMemo(() => {
    const byStatus = leadSummary?.by_status || {};
    const totalCount = leadSummary?.total ?? 0;

    const statusMap: Record<string, string> = {
      initiated: 'Initiated',
      qualified: 'Qualified',
      processed: 'Processed',
      rejected: 'Not Interested',
    };

    return KPI_CARDS_LAYOUT
      .filter((card) => card.id !== 'disqualified')
      .map((card) => {
        const count = card.id === 'total'
          ? totalCount
          : (byStatus[statusMap[card.id]] || 0);

        return {
          id: card.id,
          label: card.label,
          display: leadSummary ? count.toLocaleString() : '—',
        };
      });
  }, [leadSummary]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  // Backend provides exactly `PAGE_SIZE` leads for current page
  const visible = allLeads;

  const pageNums = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, '…', totalPages];
    if (safePage >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', safePage - 1, safePage, safePage + 1, '…', totalPages];
  }, [safePage, totalPages]);

  const allChecked = visible.length > 0 && visible.every((l: any) => selectedRows.includes(l.id + l.phone));
  const toggleAll = () => setSelectedRows(allChecked ? [] : visible.map((l: any) => l.id + l.phone));
  const toggleRow = (key: string) => setSelectedRows(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

  const clearAllFilters = () => {
    dispatch(resetFilters());
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center justify-between rounded-2xl border border-[#e9e9e9] bg-white px-6 py-5 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back, Agent</h1>
          <p className="mt-1 text-base text-text-muted">Manage, filter, and process your entire lead pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-5 py-2.5 text-base font-medium text-text-primary transition hover:bg-slate-50 active:scale-95"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => router.push('/new-lead-creation')}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-green-700 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {liveKpiStats.map((s: any, i: number) => <LeadKpiCard key={s.id} stat={s} index={i} />)}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <LeadToolbar
          search={search}
          activeTab={activeTab}
          allLeadsCount={activeTab === 'all' ? totalCount : 0}
          myLeadsCount={activeTab === 'my' ? totalCount : 0}
          unassignedLeadsCount={activeTab === 'unassigned' ? totalCount : 0}
          dateFilter={dateFilter}
          onSearchSubmit={(v: string) => {
            dispatch(setSearch(v));
            setCurrentPage(1);
            // useEffect will trigger loadLeads when search changes
          }}
          onTabChange={(k: string) => { dispatch(setActiveTab(k)); setCurrentPage(1); }}
          onDateChange={(v: string) => { dispatch(setDateFilter(v)); setCurrentPage(1); }}
          onShowAdvFilters={() => setShowAdvFilters(true)}
          onClearFilters={clearAllFilters}
        />
        <LeadTable
          visible={visible}
          selectedRows={selectedRows}
          allChecked={allChecked}
          openColFilter={openColFilter}
          colStatusFilter={colStatusFilter}
          colCallTimeFilter={colCallTimeFilter}
          navigate={router.push}
          hasFilters={!!(search.trim() || colStatusFilter.length || colCallTimeFilter.length)}
          onToggleAll={toggleAll}
          onToggleRow={toggleRow}
          onSetOpenColFilter={setOpenColFilter}
          onApplyStatusFilter={(v: string[]) => { dispatch(setColStatusFilter(v)); setCurrentPage(1); }}
          onApplyCallTimeFilter={(v: string[]) => { dispatch(setColCallTimeFilter(v)); setCurrentPage(1); }}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
        />
        <LeadPagination
          visibleCount={visible.length}
          filteredCount={totalCount}
          safePage={safePage}
          totalPages={totalPages}
          pageNums={pageNums}
          onPageChange={setCurrentPage}
        />
      </div>

      {showAdvFilters && <LeadAdvancedFilters onClose={() => setShowAdvFilters(false)} />}
    </div>
  );
}
