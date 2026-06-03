'use client';
import { useState, useMemo } from 'react';
import {
  Search, Download, RefreshCcw, ChevronLeft, ChevronRight,
  X, Check, AlertTriangle, Clock3, CheckCircle2, FileText,
  MapPin, Banknote, Calendar,
} from 'lucide-react';

import { useLoans, useUpdateLoanStatus } from '@/features/loans/hooks/useLoans';
import {
  STATUS_CFG,
  LOAN_STATUSES,
  UPDATABLE_STATUSES,
  PAGE_SIZE,
  STATUS_UPDATE_REASONS,
} from '@/features/loans/constants/loans.constants';
import LoanStatusBadge from '@/features/loans/components/LoanStatusBadge';

// ─── KPI configuration ────────────────────────────────────────────────────────
const KPI_CFG = [
  { key: 'total', label: 'Total Applications', icon: FileText, iconBg: 'bg-slate-600' },
  { key: 'Pending Review', label: 'Pending Review', icon: Clock3, iconBg: 'bg-blue-500' },
  { key: 'Action Required', label: 'Action Required', icon: AlertTriangle, iconBg: 'bg-red-500' },
  { key: 'Approved', label: 'Approved', icon: CheckCircle2, iconBg: 'bg-green-500' },
];

// ─── Update Panel ─────────────────────────────────────────────────────────────
function UpdatePanel({ loan, onClose, onConfirm }: any) {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  function handleConfirm() {
    if (!newStatus) return;
    onConfirm({ loanId: loan.id, newStatus, reason, notes });
    setDone(true);
    setTimeout(onClose, 1800);
  }

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* slide-over panel */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[500px] flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <RefreshCcw size={20} className="text-text-primary" strokeWidth={2} />
            <h3 className="text-lg font-semibold text-text-primary">Update Loan Status</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-slate-100"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          /* success state */
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check size={32} className="text-green-600" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-text-primary">Status Updated!</h4>
              <p className="mt-1.5 text-base text-text-muted">
                <span className="font-semibold text-text-primary">{loan.id}</span> has been updated to{' '}
                <span className="font-semibold text-text-primary">{newStatus}</span>.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* scrollable body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

              {/* Loan summary card */}
              <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Application Details
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Application ID', value: loan.id },
                    { label: 'Applicant', value: loan.applicant },
                    { label: 'Loan Type', value: loan.type },
                    { label: 'Loan Term', value: loan.loanTerm },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-text-muted">{label}</p>
                      <p className="mt-0.5 text-sm font-medium text-text-primary">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-3 text-sm text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={2} />
                    {loan.region}
                  </span>
                  {loan.amount && (
                    <span className="flex items-center gap-1.5">
                      <Banknote size={13} strokeWidth={2} />
                      {loan.amount} ETB
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={2} />
                    {loan.updated}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2.5">
                  <p className="text-xs text-text-muted">Current Status:</p>
                  <LoanStatusBadge status={loan.status} />
                </div>
              </div>

              {/* New Status selector */}
              <section>
                <p className="mb-3 text-sm font-semibold text-text-primary">
                  Change Status To
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {UPDATABLE_STATUSES.map((s) => {
                    const sel = newStatus === s;
                    const cfg = (STATUS_CFG as any)[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setNewStatus(s); setReason(''); }}
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${sel
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-slate-50'
                          }`}
                      >
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg?.dot ?? 'bg-slate-400'}`} />
                        <span className={`flex-1 text-sm font-medium ${sel ? 'text-green-700' : 'text-text-primary'}`}>
                          {s}
                        </span>
                        {sel && <Check size={14} className="shrink-0 text-green-600" strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Reason chips (shown only when a new status is selected) */}
              {newStatus && (
                <section>
                  <p className="mb-3 text-sm font-semibold text-text-primary">
                    Reason for Update
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {((STATUS_UPDATE_REASONS as any)[newStatus] ?? []).map((r: any) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${reason === r
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text-primary'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Notes */}
              <section>
                <p className="mb-2 text-sm font-semibold text-text-primary">
                  Notes{' '}
                  <span className="text-xs font-normal text-text-muted">(optional)</span>
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional comments or context for this update..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text-primary placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </section>
            </div>

            {/* footer */}
            <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-text-primary transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!newStatus}
                className="flex-1 rounded-xl bg-[#16A34A] py-3 text-sm font-semibold text-white transition hover:bg-[#15803d] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                Confirm Update
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function UpdateLoanStatus() {
  const { data: loans = [], isLoading } = useLoans();
  const updateLoanMutation = useUpdateLoanStatus();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [panelLoan, setPanelLoan] = useState<any>(null);

  // KPI counts
  const counts = useMemo(() => {
    const c = { total: loans.length };
    loans.forEach((l: any) => { (c as any)[l.status] = ((c as any)[l.status] || 0) + 1; });
    return c;
  }, [loans]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loans.filter(
      (l: any) =>
        (activeTab === 'All' || l.status === activeTab) &&
        (!q || `${l.id} ${l.applicant} ${l.region} ${l.type}`.toLowerCase().includes(q)),
    );
  }, [loans, search, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Page number window (up to 5 around current)
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, safePage - 3),
    Math.min(totalPages, safePage + 2),
  );

  function handleStatusUpdate({ loanId, newStatus }: any) {
    updateLoanMutation.mutate({ id: loanId, status: newStatus });
  }

  return (
    <div className="space-y-4">

      {/* ── Welcome header ─────────────────────────────────────────────────── */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e9e9e9] bg-white px-6 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Update Loan Status</h1>
          <p className="mt-1 text-base text-text-muted">
            Review and update the processing status of loan applications.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e9e9e9] bg-white px-5 py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50 active:scale-95"
        >
          <Download size={16} strokeWidth={2.5} />
          Export CSV
        </button>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI_CFG.map(({ key, label, icon: Icon, iconBg }) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-2xl border border-[#e9e9e9] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon size={21} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs text-text-muted">{label}</p>
              <p className="text-2xl font-bold text-text-primary">{(counts as any)[key] ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white shadow-sm">

        {/* Search toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#e9e9e9] px-5 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-[#f4f4f4] px-4 py-2.5">
            <Search size={16} className="shrink-0 text-text-muted" strokeWidth={2.2} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, applicant, region or type…"
              className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(1); }}
              className="text-sm font-semibold text-[#16A34A] transition hover:text-[#15803d]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[#e9e9e9] px-5">
          {LOAN_STATUSES.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-4 px-3 text-sm font-medium transition ${activeTab === tab
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
            >
              {tab}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${activeTab === tab ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-text-muted'
                  }`}
              >
                {tab === 'All' ? loans.length : ((counts as any)[tab] ?? 0)}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-[#e9e9e9] bg-slate-50">
                {[
                  'APPLICATION ID',
                  'APPLICANT',
                  'LOAN TYPE',
                  'REGION',
                  'AMOUNT (ETB)',
                  'CURRENT STATUS',
                  'LAST UPDATED',
                  'ACTION',
                ].map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9e9e9]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <RefreshCcw size={32} className="text-slate-300" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-text-muted">
                        No applications match your filters.
                      </p>
                      {(search || activeTab !== 'All') && (
                        <button
                          type="button"
                          onClick={() => { setSearch(''); setActiveTab('All'); setPage(1); }}
                          className="text-sm font-semibold text-[#16A34A] hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((loan: any) => (
                  <tr key={loan.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#16A34A]">{loan.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-text-primary">{loan.applicant}</p>
                      <p className="text-xs text-text-muted">{loan.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-text-primary">{loan.type}</td>
                    <td className="px-5 py-4 text-text-primary">{loan.region}</td>
                    <td className="px-5 py-4 font-medium text-text-primary">
                      {loan.amount ? `${loan.amount} ETB` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-5 py-4 text-text-muted">{loan.updated}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setPanelLoan(loan)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-600 bg-white px-3.5 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50 active:scale-95"
                      >
                        <RefreshCcw size={12} strokeWidth={2.5} />
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e9e9e9] px-5 py-4">
          <p className="text-sm text-text-muted">
            Showing{' '}
            <span className="font-semibold text-text-primary">{visible.length}</span>{' '}
            of{' '}
            <span className="font-semibold text-text-primary">{filtered.length}</span>{' '}
            applications
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 rounded-lg border border-[#e9e9e9] bg-white px-4 py-2 text-sm text-text-muted transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Prev
            </button>

            {pageNums.map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setPage(pg)}
                aria-current={safePage === pg ? 'page' : undefined}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition ${safePage === pg
                  ? 'bg-green-600 text-white'
                  : 'border border-[#e9e9e9] bg-white text-text-muted hover:bg-slate-50'
                  }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-[#e9e9e9] bg-white px-4 py-2 text-sm text-text-muted transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Update Status Panel ─────────────────────────────────────────────── */}
      {panelLoan && (
        <UpdatePanel
          loan={panelLoan}
          onClose={() => setPanelLoan(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </div>
  );
}

export default UpdateLoanStatus;
