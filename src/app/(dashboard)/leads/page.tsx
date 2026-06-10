'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus } from 'lucide-react';

import { PAGE_SIZE, KPI_CARDS_LAYOUT, LEAD_STATUS_MAP, resolveDateFilter } from '@/features/leads/constants/leads.constants';

import LeadKpiCard from '@/features/leads/components/LeadKpiCard';
import LeadToolbar from '@/features/leads/components/LeadToolbar';
import LeadTable from '@/features/leads/components/LeadTable';
import LeadPagination from '@/features/leads/components/LeadPagination';
import AdvancedFilters from '@/components/ui/AdvancedFilters';

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
import { fetchLeadMetadataThunk } from '@/features/new-lead/store/newLeadSlice';

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
  const [tabCounts, setTabCounts] = useState({ all: 0, my: 0, unassigned: 0 });

  useEffect(() => {
    // Calculate counts dynamically from allLeads since the backend doesn't filter by assigned_to
    const myCount = allLeads.filter(l => l.assignedTo === 'me' || l.owner === 'me').length;
    const unassignedCount = allLeads.filter(l => !l.assignedTo || l.owner === 'unassigned').length;

    setTabCounts({
      all: totalCount,
      my: myCount,
      unassigned: unassignedCount
    });
  }, [allLeads, totalCount]);

  // Initial Summary Fetch
  useEffect(() => {
    dispatch(fetchLeadSummary());
    dispatch(fetchLeadMetadataThunk());
  }, [dispatch]);

  // Load  filtered leads data from backend
  const loadLeads = useCallback((page: number) => {
    const hasCustomRange = !!(advFilters.dateFrom || advFilters.dateTo); // check if custom date range is selected
    const activePreset = !hasCustomRange && (advFilters.quickDate || (dateFilter !== 'All Time' ? dateFilter : null));
    const resolvedPreset = activePreset ? resolveDateFilter(activePreset) : null;

    const start_date = advFilters.dateFrom || resolvedPreset?.start;
    const end_date = advFilters.dateTo || resolvedPreset?.end;

    // Combine Statuses
    // NOTE: only we are expanding (e.g. "Active" expands to ['Initiated', 'Open'])
    const expandedAdvStatuses = advFilters.statuses.flatMap(id => LEAD_STATUS_MAP[id] || [id]);
    const allStatuses = Array.from(new Set([...colStatusFilter, ...expandedAdvStatuses]));
    const statusParam = allStatuses.length > 0 ? allStatuses.join(',') : undefined;

    // Combine Search
    let finalSearch = search;
    if (advFilters.location?.trim()) {
      finalSearch = finalSearch ? `${finalSearch} ${advFilters.location.trim()}` : advFilters.location.trim();
    }

    const min_amount = advFilters.minAmount !== null ? advFilters.minAmount : undefined;
    const max_amount = advFilters.maxAmount !== null ? advFilters.maxAmount : undefined;
    const loan_type = advFilters.loanType || undefined;
    const lead_source = advFilters.leadSources?.length > 0 ? advFilters.leadSources.join(',') : undefined;

    dispatch(fetchLeads({
      start: (page - 1) * PAGE_SIZE,
      page_length: PAGE_SIZE,
      search_query: finalSearch,
      status: statusParam,
      start_date,
      end_date,
      min_amount,
      max_amount,
      loan_type,
      lead_source
    }));
  }, [dispatch, colStatusFilter, search, advFilters, dateFilter]);

  // fetched only once during mount
  useEffect(() => {
    loadLeads(currentPage);
  }, [loadLeads, currentPage]);


  const liveKpiStats = useMemo(() => {
    const byStatus = leadSummary?.by_status || {};
    const totalCount = leadSummary?.total ?? 0;

    return KPI_CARDS_LAYOUT.map((card) => {
      const count = card.id === 'total'
        ? totalCount
        : (LEAD_STATUS_MAP[card.id] || []).reduce((sum, status) => sum + (byStatus[status] || 0), 0);

      return {
        id: card.id,
        label: card.label,
        display: leadSummary ? count.toLocaleString() : '—',
      };
    });
  }, [leadSummary]);

  const currentTabTotalCount = activeTab === 'my' ? tabCounts.my : activeTab === 'unassigned' ? tabCounts.unassigned : tabCounts.all;
  const totalPages = Math.max(1, Math.ceil(currentTabTotalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  // Filter leads locally for the active tab since backend does not apply assigned_to parameter
  const visible = useMemo(() => {
    return allLeads.filter((lead: any) => {
      if (activeTab === 'my') return lead.assignedTo === 'me' || lead.owner === 'me';
      if (activeTab === 'unassigned') return !lead.assignedTo || lead.owner === 'unassigned';
      return true;
    });
  }, [allLeads, activeTab]);

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
            onClick={() => router.push('/leads/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-green-700 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Lead
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {liveKpiStats.map((s: any, i: number) => (
          <div key={s.id} className="min-w-[240px] shrink-0">
            <LeadKpiCard stat={s} index={i} />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <LeadToolbar
          search={search}
          activeTab={activeTab}
          allLeadsCount={tabCounts.all}
          myLeadsCount={tabCounts.my}
          unassignedLeadsCount={tabCounts.unassigned}
          onSearchSubmit={(v: string) => {
            dispatch(setSearch(v));
            setCurrentPage(1);
            // useEffect will trigger loadLeads when search changes
          }}
          onTabChange={(k: string) => { dispatch(setActiveTab(k)); setCurrentPage(1); }}
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
          filteredCount={currentTabTotalCount}
          safePage={safePage}
          totalPages={totalPages}
          pageNums={pageNums}
          onPageChange={setCurrentPage}
        />
      </div>

      {showAdvFilters && <AdvancedFilters onClose={() => setShowAdvFilters(false)} mode="leads" />}
    </div>
  );
}
