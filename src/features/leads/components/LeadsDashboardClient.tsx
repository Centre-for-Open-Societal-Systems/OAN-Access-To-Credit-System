'use client';

import { FileOutput, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { KPI_CARDS_LAYOUT, LEAD_STATUS_MAP, resolveDateFilter } from '@/features/leads/constants/leads.constants';
import type { KpiStat, Lead } from '@/features/leads/types/leads.types';

import LeadKpiCard from '@/features/leads/components/LeadKpiCard';
import { TablePagination } from '@/components/ui/TablePagination';
import LeadTable from '@/features/leads/components/LeadTable';
import LeadToolbar from '@/features/leads/components/LeadToolbar';
import dynamic from 'next/dynamic';

const LeadAdvancedFilters = dynamic(() => import('@/features/leads/components/LeadAdvancedFilters'), {
  ssr: false,
});

import { AccessDenied } from '@/components/AccessDenied';
import { DiscoverLoansCta } from '@/components/DiscoverLoansCta';
import { ConnectionError } from '@/components/ConnectionError';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectOfficerName } from '@/features/auth/store/authSlice';
import {
    fetchLeads,
    fetchLeadSummary, resetFilters, selectActiveTab, selectAdvFilters, selectColCallTimeFilter, selectColStatusFilter, selectDateFilter, selectHasActiveLeadFilters, selectIsLeadsLoading, selectLeads, selectLeadsError, selectLeadSummary,
    selectSearch, selectTotalCount, setActiveTab, setColCallTimeFilter, setColStatusFilter, setSearch, setSort
} from '@/features/leads/store/leadSlice';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { fetchLeadMetadataThunk } from '@/features/new-lead/store/newLeadSlice';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { fetchTaxonomy } from '@/features/seller/store/loanProductsSlice';
import { ApiErrorCode, classifyError } from '@/lib/api/apiErrors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function LeadsDashboardClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const officerName = useAppSelector(selectOfficerName);
  const allLeads = useAppSelector(selectLeads) || [];
  const isLoading = useAppSelector(selectIsLeadsLoading);
  const leadSummary = useAppSelector(selectLeadSummary);
  const totalCount = useAppSelector(selectTotalCount);
  const leadsError = useAppSelector(selectLeadsError);

  const search = useAppSelector(selectSearch);
  const activeTab = useAppSelector(selectActiveTab);
  const dateFilter = useAppSelector(selectDateFilter);
  const colStatusFilter = useAppSelector(selectColStatusFilter);
  const colCallTimeFilter = useAppSelector(selectColCallTimeFilter);
  const advFilters = useAppSelector(selectAdvFilters);
  const hasActiveFilters = useAppSelector(selectHasActiveLeadFilters);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [openColFilter, setOpenColFilter] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // officerName comes from client-only auth state, so rendering it during
    // SSR would mismatch on hydration — this gates it until after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const tabCounts = useMemo(() => {
    const tc = leadSummary?.tab_counts;
    if (tc) return { all: tc.all, my: tc.my, unassigned: tc.unassigned };
    return {
      all: activeTab === 'all' ? totalCount : 0,
      my: activeTab === 'my' ? totalCount : 0,
      unassigned: activeTab === 'unassigned' ? totalCount : 0,
    };
  }, [leadSummary, activeTab, totalCount]);

  // Initial Summary Fetch
  useEffect(() => {
    dispatch(fetchLeadSummary());
    dispatch(fetchLeadMetadataThunk());
    dispatch(fetchTaxonomy());
  }, [dispatch]);

  // Load filtered leads data from backend
  const loadLeads = useCallback((page: number) => {
    const hasCustomRange = !!(advFilters.dateFrom || advFilters.dateTo); // check if custom date range is selected
    const activePreset = !hasCustomRange && (advFilters.quickDate || (dateFilter !== 'All Time' ? dateFilter : null));
    const resolvedPreset = activePreset ? resolveDateFilter(activePreset) : null;

    const start_date = advFilters.dateFrom || resolvedPreset?.start;
    const end_date = advFilters.dateTo || resolvedPreset?.end;

    // Combine Statuses
    const allStatuses = advFilters.statuses.flatMap(id => LEAD_STATUS_MAP[id.toLowerCase()] || [id]);
    const statusParam = allStatuses.length > 0 ? allStatuses.join(',') : undefined;

    // The region goes out as its own filter. It used to be appended to the search
    // box's text, but `search_query` only ORs over name/phone/external_id — so a
    // search plus a region became one string that matched neither, and the page
    // came back empty every time both were set.
    const region = advFilters.region.trim() || undefined;

    const min_amount = advFilters.minAmount !== null ? advFilters.minAmount : undefined;
    const max_amount = advFilters.maxAmount !== null ? advFilters.maxAmount : undefined;
    const loan_type = advFilters.loanType?.length > 0 ? advFilters.loanType.join(',') : undefined;
    const lead_source = advFilters.leadSources?.length > 0 ? advFilters.leadSources.join(',') : undefined;

    // Scope the queue server-side: "My" → my email, "Unassigned" → the literal
    // 'unassigned', "All" → omit. (Falls back to no scope if email isn't loaded.)
    const assigned_to =
      activeTab === 'my' ? 'my'
        : activeTab === 'unassigned' ? 'unassigned'
          : undefined;

    return dispatch(fetchLeads({
      start: (page - 1) * pageSize,
      page_length: pageSize,
      search_query: search,
      status: statusParam,
      start_date,
      end_date,
      min_amount,
      max_amount,
      loan_type,
      region,
      lead_source,
      assigned_to,
      sort_by: advFilters.sortBy,
      sort_order: advFilters.sortOrder,
    }));
  }, [dispatch, search, advFilters, dateFilter, activeTab, pageSize]);

  // fetched only once during mount or when dependencies change
  useEffect(() => {
    // Abort the in-flight request when inputs change (or on unmount) so a
    // slower earlier response can't overwrite the results for a newer query.
    const promise = loadLeads(currentPage);
    return () => {
      promise.abort();
    };
  }, [loadLeads, currentPage, pageSize]);


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

  // `totalCount` reflects the active tab now that filtering is server-side.
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  // The backend already filters by tab (assigned_to) and paginates, but if it 
  // fails to paginate and returns all leads, we fallback to client-side slicing.
  const visible = allLeads.length > pageSize 
    ? allLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
    : allLeads;

  const allChecked = visible.length > 0 && visible.every((l: Lead) => selectedRows.includes(l.id + l.phone));
  const toggleAll = () => setSelectedRows(allChecked ? [] : visible.map((l: Lead) => l.id + l.phone));
  const toggleRow = (key: string) => setSelectedRows(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

  const clearAllFilters = () => {
    dispatch(resetFilters());
    setCurrentPage(1);
  };

  const handleSliderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    if (scrollWidth <= clientWidth) return;
    const scrollPercentage = scrollLeft / (scrollWidth - clientWidth);
    if (scrollPercentage > 0.6) setSliderIndex(2);
    else if (scrollPercentage > 0.3) setSliderIndex(1);
    else setSliderIndex(0);
  };

  const handleExportCSV = () => {
    // Export the user's selected rows; if none are selected, fall back to the
    // current filtered view. Selection is client-side and only spans loaded
    // rows, so this is intentionally a frontend export of what the user picked —
    // not a full-dataset export (that would need a backend endpoint).
    const source = selectedRows.length > 0
      ? allLeads.filter((l: Lead) => selectedRows.includes(l.id + l.phone))
      : visible;

    if (source.length === 0) return;

    const headers = ['ID', 'Farmer Name', 'Phone', 'Status', 'Location', 'Loan Type', 'Loan Amount', 'Source', 'Assigned To', 'Visit Date'];
    const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...source.map((lead: Lead) => [
        lead.id,
        lead.name,
        lead.phone,
        lead.status,
        lead.location,
        lead.loanType,
        lead.loanAmount,
        lead.source,
        lead.assignedTo || '',
        lead.visitDate || ''
      ].map(escape).join(','))
    ].join('\n');

    // Prepend a BOM so Excel opens UTF-8 (e.g. Amharic names) correctly, and use
    // a Blob rather than a data: URI to avoid URL-length limits on large exports.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Feature-level permission denial: the user is authenticated but not allowed
  // to view the leads pipeline. Show Access Denied rather than an empty table.
  const errorCode = classifyError(leadsError);

  if (errorCode === ApiErrorCode.Forbidden) {
    return <AccessDenied message="You don't have permission to view the leads dashboard." />;
  }

  // Connectivity / server failure (502, 5xx, network down, timeout). This is not
  // the user's fault and is not "no leads", so we show a retryable error rather
  // than the empty state. Only when there is no data already on screen — if a
  // background refresh fails we keep the stale table instead of blanking it.
  // (UNAUTHORIZED is handled globally by the store middleware, which logs out.)
  if (leadsError && allLeads.length === 0 && !isLoading) {
    return <ConnectionError onRetry={() => loadLeads(currentPage)} />;
  }

  return (
    <div className="space-y-4 min-w-0 w-full">
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0 rounded-2xl border border-[#e9e9e9] bg-white px-6 py-5 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <div className="flex-1 min-w-0 pr-0 lg:pr-4">
          <h1 className="text-2xl font-bold text-text-primary">Welcome, {isMounted && officerName ? officerName : 'Agent'}</h1>
          <p className="mt-1 text-base text-text-muted">Manage, filter, and process your entire lead pipeline.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-semibold w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-5 py-3 text-base font-medium text-text-primary transition hover:bg-slate-50 active:scale-95"
          >
            <FileOutput size={18} />
            {/* Only a partial selection differs from a page export: select-all (allChecked)
                covers the whole current page, which is identical to exporting with no selection. */}
            {selectedRows.length > 0 && !allChecked ? `Export Selected (${selectedRows.length})` : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/leads/new')}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-green-700 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Lead
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <div
          className="flex w-full justify-start gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
          onScroll={handleSliderScroll}
        >
          {liveKpiStats.map((s: KpiStat, i: number) => (
            <div key={s.id} className="flex-1 min-w-[175px] shrink-0 snap-start">
              <LeadKpiCard stat={s} index={i} />
            </div>
          ))}
        </div>
        {/* Slider Indicator (3 dots) */}
        <div className="flex justify-center items-center gap-1.5 pb-1 mt-2">
          {[0, 1, 2].map(idx => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-colors duration-300 ${sliderIndex === idx ? 'w-2 bg-[#16A34A]' : 'w-2 bg-gray-200'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* A development agent browses the catalogue on a farmer's behalf, so the
          way in belongs on the screen where they work leads. `/loan-discovery`,
          not `/discover-loans`: the dev-agent portal mounts the same catalogue
          under its own route. */}
      <DiscoverLoansCta
        href="/loan-discovery"
        title="Browse loans for a farmer"
        description="Compare products from every participating bank before starting an application on a lead's behalf."
      />

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
          // Every filter surface, not just search + the two column filters: a date
          // range, an amount bucket, a lead source or a region left this false, so a
          // filtered-empty table claimed there were no leads at all and hid the
          // "Clear Filters" affordance that was the only way back.
          hasFilters={hasActiveFilters}
          onToggleAll={toggleAll}
          onToggleRow={toggleRow}
          onSetOpenColFilter={setOpenColFilter}
          onApplyStatusFilter={(v: string[]) => { dispatch(setColStatusFilter(v)); setCurrentPage(1); }}
          onApplyCallTimeFilter={(v: string[]) => { dispatch(setColCallTimeFilter(v)); setCurrentPage(1); }}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          sortBy={advFilters.sortBy}
          sortOrder={advFilters.sortOrder}
          onSortChange={(sortBy, sortOrder) => {
            dispatch(setSort({ sortBy, sortOrder }));
            setCurrentPage(1);
          }}
        />
        {(visible.length > 0 || isLoading) && (
          <TablePagination
            visibleCount={visible.length}
            totalCount={totalCount}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {showAdvFilters && <LeadAdvancedFilters onClose={() => setShowAdvFilters(false)} />}
    </div>
  );
}
