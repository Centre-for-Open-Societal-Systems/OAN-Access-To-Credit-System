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
import { useLeads, useLeadSummary } from '@/features/leads/hooks/useLeads';

export default function LeadsDashboard() {
  const router = useRouter();
  const { data: allLeads = [], isLoading } = useLeads();
  const { data: leadSummary } = useLeadSummary();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openColFilter, setOpenColFilter] = useState<string | null>(null);
  const [colStatusFilter, setColStatusFilter] = useState<string[]>([]);
  const [colCallTimeFilter, setColCallTimeFilter] = useState<string[]>([]);

  const myLeads = useMemo(() => allLeads.filter((l: any) => l.owner === 'me'), [allLeads]);
  const unassignedLeads = useMemo(() => allLeads.filter((l: any) => l.owner === 'unassigned'), [allLeads]);
  const baseLeads = activeTab === 'my' ? myLeads : activeTab === 'unassigned' ? unassignedLeads : allLeads;

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

  function parseCallDate(callStartTime?: string): Date | null {
    if (!callStartTime) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (callStartTime.startsWith('Today')) return new Date(today);
    if (callStartTime.startsWith('Yesterday')) return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const match = callStartTime.match(/^([A-Za-z]+ \d+)/);
    if (match) return new Date(`${match[1]}, ${today.getFullYear()}`);
    return null;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const daysMap: Record<string, number> = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'Last 90 Days': 90 };
    const filterDays = daysMap[dateFilter] ?? null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = filterDays ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - (filterDays - 1)) : null;

    return baseLeads.filter((l: any) => {
      if (q && !`${l.id} ${l.phone} ${l.status} ${l.location}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (colStatusFilter.length > 0 && !colStatusFilter.includes(l.status)) return false;
      if (cutoff) {
        const leadDate = parseCallDate(l.callStartTime);
        if (!leadDate || leadDate < cutoff) return false;
      }
      if (colCallTimeFilter.length > 0) {
        const leadDate = parseCallDate(l.callStartTime);
        const t = l.callStartTime ?? '';
        const matches = colCallTimeFilter.some(period => {
          if (period === 'Today') return t.startsWith('Today');
          if (period === 'Yesterday') return t.startsWith('Yesterday');
          if (period === 'Last 7 Days') {
            const c = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
            return leadDate != null && leadDate >= c;
          }
          if (period === 'Last 30 Days') {
            const c = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
            return leadDate != null && leadDate >= c;
          }
          if (period === 'Last 90 Days') {
            const c = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89);
            return leadDate != null && leadDate >= c;
          }
          return true;
        });
        if (!matches) return false;
      }
      return true;
    });
  }, [baseLeads, search, statusFilter, dateFilter, colStatusFilter, colCallTimeFilter]);

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
    setSearch(''); setStatusFilter('All'); setDateFilter('All Time');
    setColStatusFilter([]); setColCallTimeFilter([]); setCurrentPage(1);
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
          myLeadsCount={myLeads.length}
          unassignedLeadsCount={unassignedLeads.length}
          dateFilter={dateFilter}
          onSearchChange={(v: string) => { setSearch(v); setCurrentPage(1); }}
          onTabChange={(k: string) => { setActiveTab(k); setCurrentPage(1); }}
          onDateChange={(v: string) => { setDateFilter(v); setCurrentPage(1); }}
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
          onApplyStatusFilter={setColStatusFilter}
          onApplyCallTimeFilter={setColCallTimeFilter}
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
