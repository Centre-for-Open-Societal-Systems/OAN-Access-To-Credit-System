'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Plus } from 'lucide-react';
import { kpiStats } from '@/mocks/leads.mock';
import { PAGE_SIZE } from '@/features/leads/constants/leads.constants';
import LeadKpiCard from '@/features/leads/components/LeadKpiCard';
import LeadToolbar from '@/features/leads/components/LeadToolbar';
import LeadTable from '@/features/leads/components/LeadTable';
import LeadPagination from '@/features/leads/components/LeadPagination';
import LeadAdvancedFilters from '@/features/leads/components/LeadAdvancedFilters';
import LeadLoadingSkeleton from '@/features/leads/components/LeadLoadingSkeleton';
import { useDispatch, useSelector } from 'react-redux';
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
  selectFilteredLeads,
} from '@/features/leads/store/leadSlice';
import type { AppDispatch } from '@/store';

export default function LeadsDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const allLeads = useSelector(selectLeads) || [];
  const isLoading = useSelector(selectIsLeadsLoading);
  const leadSummary = useSelector(selectLeadSummary);

  React.useEffect(() => {
    dispatch(fetchLeads());
    dispatch(fetchLeadSummary());
  }, [dispatch]);

  const search = useSelector(selectSearch);
  const activeTab = useSelector(selectActiveTab);
  const dateFilter = useSelector(selectDateFilter);
  const colStatusFilter = useSelector(selectColStatusFilter);
  const colCallTimeFilter = useSelector(selectColCallTimeFilter);
  const filtered = useSelector(selectFilteredLeads);

  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openColFilter, setOpenColFilter] = useState<string | null>(null);

  const myLeadsCount = useMemo(() => allLeads.filter((l: any) => l.owner === 'me').length, [allLeads]);
  const unassignedLeadsCount = useMemo(() => allLeads.filter((l: any) => l.owner === 'unassigned').length, [allLeads]);

  const liveKpiStats = useMemo(() => {
    if (!leadSummary) return kpiStats.filter((s: any) => s.id !== 'disqualified');

    const byStatus = leadSummary.by_status || {};
    
    return kpiStats
      .filter((s: any) => s.id !== 'disqualified')
      .map((s: any) => {
        let count = 0;
        if (s.id === 'total') count = leadSummary.total || 0;
        else if (s.id === 'initiated') count = byStatus['Initiated'] || 0;
        else if (s.id === 'qualified') count = byStatus['Qualified'] || 0;
        else if (s.id === 'processed') count = byStatus['Processed'] || 0;
        else if (s.id === 'rejected') count = byStatus['Not Interested'] || byStatus['Rejected'] || 0;
        
        return {
          ...s,
          display: count.toLocaleString(),
        };
      });
  }, [leadSummary]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

  if (isLoading) {
    return <LeadLoadingSkeleton />;
  }

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
          allLeadsCount={allLeads.length}
          myLeadsCount={myLeadsCount}
          unassignedLeadsCount={unassignedLeadsCount}
          dateFilter={dateFilter}
          onSearchChange={(v: string) => { dispatch(setSearch(v)); setCurrentPage(1); }}
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
        />
        <LeadPagination
          visibleCount={visible.length}
          filteredCount={filtered.length}
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
