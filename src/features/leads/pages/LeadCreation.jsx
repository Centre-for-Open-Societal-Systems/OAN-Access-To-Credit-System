import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight,
  Download, Plus, X, Phone, TrendingUp, TrendingDown, Minus,
  Users, PhoneCall, CheckCircle2, UserX, ClipboardCheck, CircleAlert,
  Globe, Link2, Mail, Code2,
} from 'lucide-react';

import { kpiStats, leadRows as allLeads } from '../data/leads.mock.js';

const STATUS_CFG = {
  Initiated:    { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200'         },
  Qualified:    { dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700 border-green-200'       },
  Processed:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Disqualified: { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200'             },
  Rejected:     { dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-700 border-orange-200'    },
};

const STATUS_OPTS = ['All', 'Initiated', 'Qualified', 'Processed', 'Disqualified', 'Rejected'];
const SOURCE_OPTS = ['All', 'Organic Search', 'Paid Social', 'Referral', 'Direct Traffic', 'Email Campaign', 'API Integration'];
const CALLST_OPTS = ['All', 'Connected', 'Missed', 'Callback'];
const DATE_OPTS   = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom Range'];
const PAGE_SIZE   = 10;

function getSourceIcon(source) {
  switch (source) {
    case 'Organic Search':  return <Globe  size={18} className="text-slate-500" />;
    case 'Paid Social':     return <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-[#0A66C2] text-[9px] font-bold leading-none text-white">in</span>;
    case 'Referral':        return <Link2  size={18} className="text-slate-500" />;
    case 'Direct Traffic':  return <Globe  size={18} className="text-slate-400" />;
    case 'Email Campaign':  return <Mail   size={18} className="text-slate-500" />;
    case 'API Integration': return <Code2  size={18} className="text-slate-500" />;
    default:                return <Globe  size={18} className="text-slate-400" />;
  }
}

function getKpiIconCfg(id) {
  switch (id) {
    case 'total':        return { bg: 'bg-blue-100',   icon: <Users          size={24} className="text-blue-600"    /> };
    case 'initiated':    return { bg: 'bg-indigo-100', icon: <PhoneCall      size={24} className="text-indigo-600"  /> };
    case 'qualified':    return { bg: 'bg-green-100',  icon: <CheckCircle2   size={24} className="text-green-600"   /> };
    case 'disqualified': return { bg: 'bg-amber-100',  icon: <UserX          size={24} className="text-amber-600"   /> };
    case 'processed':    return { bg: 'bg-teal-100',   icon: <ClipboardCheck size={24} className="text-teal-600"    /> };
    case 'rejected':     return { bg: 'bg-red-100',    icon: <CircleAlert    size={24} className="text-red-600"     /> };
    default:             return { bg: 'bg-slate-100',  icon: <Users          size={24} className="text-slate-500"   /> };
  }
}

function StatusBadge({ status, delay }) {
  const cfg = STATUS_CFG[status] ?? { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span
      className={`animate-badge-pop inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition-transform duration-150 hover:scale-105 ${cfg.badge}`}
      style={{ animationDelay: delay }}
    >
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function KpiCard({ stat, index }) {
  const cfg       = getKpiIconCfg(stat.id);
  const color     = stat.up === true ? 'text-green-600' : stat.up === false ? 'text-red-500' : 'text-orange-400';
  const TrendIcon = stat.up === true ? TrendingUp : stat.up === false ? TrendingDown : Minus;
  return (
    <div className="relative bg-white border border-[#f4f4f4] rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden flex items-start justify-between"
  
      
      
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div>
        <p className="text-sm text-text-muted">{stat.label}</p>
        <p className="mt-1.5 text-4xl font-bold text-text-primary">{stat.display}</p>
        <div className={`mt-1.5 flex items-center gap-1 text-sm font-medium ${color}`}>
          <TrendIcon size={14} strokeWidth={2.5} />
          <span>{stat.trend.toFixed(1)}%</span>
          <span className="font-normal text-text-muted">vs last month</span>
        </div>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        {cfg.icon}
      </div>
    </div>
  );
}

function AdvancedFiltersPanel({ onClose }) {
  const [selStatuses, setSelStatuses] = useState([]);
  const [callSt,      setCallSt]      = useState('All');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');

  const toggle      = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const activeCount = selStatuses.length + (callSt !== 'All' ? 1 : 0) + (dateFrom ? 1 : 0);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border-subtle bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h3 className="text-base font-semibold text-text-primary">Advanced Filters</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={18} className="text-text-muted" />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Status</p>
            <div className="space-y-2">
              {STATUS_OPTS.filter(s => s !== 'All').map(s => (
                <label key={s} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={selStatuses.includes(s)} onChange={() => toggle(selStatuses, setSelStatuses, s)} className="h-4 w-4 rounded border-border-subtle accent-green-600" />
                  <span className="text-sm text-text-primary">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Call Status</p>
            <div className="flex flex-wrap gap-2">
              {CALLST_OPTS.map(o => (
                <button key={o} type="button" onClick={() => setCallSt(o)} className={`rounded-full border px-3 py-1 text-sm font-medium transition ${callSt === o ? 'border-green-600 bg-green-50 text-green-700' : 'border-border-subtle text-text-muted hover:border-green-400'}`}>{o}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Date Range</p>
            <div className="flex gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="flex-1 rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className="flex-1 rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DATE_OPTS.map(o => (
                <button key={o} type="button" className="rounded-full border border-border-subtle px-3 py-1 text-sm text-text-muted transition hover:border-green-400 hover:text-green-700">{o}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 border-t border-border-subtle px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border-subtle py-2.5 text-sm font-medium text-text-primary transition hover:bg-slate-50">Reset Filters</button>
          <button type="button" onClick={onClose} className="relative flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
            Apply Filters
            {activeCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{activeCount}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function LeadCreation() {
  const navigate = useNavigate();

  const [search,         setSearch]         = useState('');
  const [activeTab,      setActiveTab]      = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [sourceFilter,   setSourceFilter]   = useState('All');
  const [callStFilter,   setCallStFilter]   = useState('All');
  const [dateFilter,     setDateFilter]     = useState('Last 30 Days');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [selectedRows,   setSelectedRows]   = useState([]);
  const [activeTags,     setActiveTags]     = useState([
    { key: 'date',   label: 'Date: Last 30 Days'   },
    { key: 'status', label: 'Status: Not Rejected' },
  ]);

  const myLeads         = useMemo(() => allLeads.filter(l => l.owner === 'me'),         []);
  const unassignedLeads = useMemo(() => allLeads.filter(l => l.owner === 'unassigned'), []);
  const baseLeads       = activeTab === 'my' ? myLeads : activeTab === 'unassigned' ? unassignedLeads : allLeads;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseLeads.filter(l => {
      if (q && !`${l.id} ${l.phone} ${l.source} ${l.status} ${l.location}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (sourceFilter !== 'All' && l.source !== sourceFilter) return false;
      return true;
    });
  }, [baseLeads, search, statusFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const visible    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNums = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)              return [1, 2, 3, '…', totalPages];
    if (safePage >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', safePage - 1, safePage, safePage + 1, '…', totalPages];
  }, [safePage, totalPages]);

  const allChecked = visible.length > 0 && visible.every(l => selectedRows.includes(l.id));
  const toggleAll  = () => setSelectedRows(allChecked ? [] : visible.map(l => l.id));
  const toggleRow  = id => setSelectedRows(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const removeTag  = key => setActiveTags(p => p.filter(t => t.key !== key));

  return (
    <div className="animate-[fadeIn_0.3s_ease-out_both] space-y-4">

      {/* welcome header */}

{/* relative bg-white border border-[#f4f4f4] rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden flex items-start justify-between */}


      <div className="relative bg-white  hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-between rounded-2xl border border-border-subtle bg-white px-6 py-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back, Agent</h1>
          <p className="mt-1 text-base text-text-muted">Manage, filter, and process your entire lead pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-5 py-2.5 text-base font-medium text-text-primary transition hover:bg-slate-50 active:scale-95">
            <Download size={18} />
            Export CSV
          </button>
          <button type="button" onClick={() => navigate('/leads/new')} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-green-700 active:scale-95">
            <Plus size={18} strokeWidth={2.5} />
            Create New Lead
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpiStats.map((s, i) => <KpiCard key={s.id} stat={s} index={i} />)}
      </div>

      {/* search + filters */}
      <div className="animate-fade-in-up space-y-3 rounded-2xl border border-border-subtle bg-white px-5 py-4 shadow-sm" style={{ animationDelay: '0.42s' }}>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-slate-50 px-4 py-2.5">
            <Search size={18} className="shrink-0 text-text-muted" />
            <input
              type="text"
              placeholder="Search by Lead ID or Phone Number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          <button type="button" className="rounded-xl bg-gray-900 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-gray-800 active:scale-95">Search</button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">▼ All Active (12k)</button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-4 py-2 text-sm font-medium text-text-muted transition hover:bg-slate-50">Needs Action (342)</button>
          <button type="button" onClick={() => setShowAdvFilters(true)} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-slate-50">
            <SlidersHorizontal size={16} />
            Advanced Filters
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-sm font-medium text-text-muted">Filter by:</span>
          {[
            { label: 'Status',      value: statusFilter, opts: STATUS_OPTS, set: v => { setStatusFilter(v); setCurrentPage(1); } },
            { label: 'Source',      value: sourceFilter, opts: SOURCE_OPTS, set: v => { setSourceFilter(v); setCurrentPage(1); } },
            { label: 'Call Status', value: callStFilter, opts: CALLST_OPTS, set: v => { setCallStFilter(v); setCurrentPage(1); } },
            { label: 'Date',        value: dateFilter,   opts: DATE_OPTS,   set: v => { setDateFilter(v);   setCurrentPage(1); } },
          ].map(({ label, value, opts, set }, i) => (
            <span key={label} className="inline-flex items-center">
              {i > 0 && <span className="mx-2 select-none text-slate-300">|</span>}
              <span className="text-sm text-text-muted">{label}:&nbsp;</span>
              <div className="relative inline-flex items-center">
                <select value={value} onChange={e => set(e.target.value)} className="appearance-none border-0 bg-transparent py-0.5 pr-5 text-sm font-medium text-text-primary focus:outline-none cursor-pointer">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-0 text-text-muted" />
              </div>
            </span>
          ))}
          <button type="button" onClick={() => { setStatusFilter('All'); setSourceFilter('All'); setCallStFilter('All'); setDateFilter('Last 30 Days'); setActiveTags([]); setCurrentPage(1); }} className="ml-auto text-sm font-semibold text-teal-600 transition hover:text-teal-700">
            Clear Filters
          </button>
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-muted">Active:</span>
            {activeTags.map(t => (
              <span key={t.key} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-text-primary">
                {t.label}
                <button type="button" onClick={() => removeTag(t.key)} className="ml-0.5 transition hover:text-red-500"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* table card */}
      <div className="animate-scale-in overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm" style={{ animationDelay: '0.52s' }}>

        <div className="flex items-center gap-6 border-b border-border-subtle px-5">
          {[
            { key: 'all',        label: 'All Leads',  count: '12.4k'               },
            { key: 'my',         label: 'My Leads',   count: myLeads.length        },
            { key: 'unassigned', label: 'Unassigned', count: unassignedLeads.length },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => { setActiveTab(t.key); setCurrentPage(1); }} className={`flex items-center gap-2 border-b-2 py-4 text-base font-medium transition ${activeTab === t.key ? 'border-green-600 text-green-600' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${activeTab === t.key ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-text-muted'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border-subtle bg-slate-50">
                <th className="w-12 px-5 py-4">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded border-border-subtle accent-green-600" />
                </th>
                {['LEAD ID', 'PHONE NUMBER', 'LEAD SOURCE', 'STATUS', 'CALL START TIME', 'ACTIONS'].map(col => (
                  <th key={col} className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {col !== 'ACTIONS'
                      ? <span className="inline-flex cursor-pointer items-center gap-1 hover:text-text-primary">{col} <span className="text-[11px]">⇅</span></span>
                      : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {visible.map((lead, i) => {
                const delay = `${0.56 + i * 0.055}s`;
                return (
                  <tr key={lead.id} className={`animate-fade-in-left transition-colors ${selectedRows.includes(lead.id) ? 'bg-green-50/40' : 'hover:bg-slate-50'}`} style={{ animationDelay: delay }}>
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selectedRows.includes(lead.id)} onChange={() => toggleRow(lead.id)} className="h-4 w-4 rounded border-border-subtle accent-green-600" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-base font-bold text-text-primary">{lead.id}</div>
                      <div className="mt-0.5 text-sm text-text-muted">{lead.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 text-sm text-text-primary">
                        <Phone size={14} className="text-text-muted" />
                        {lead.phone}
                      </div>
                      <div className="mt-0.5 text-sm text-text-muted">Called: {lead.calledPhone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-text-primary">
                        {getSourceIcon(lead.source)}
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} delay={delay} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-text-primary">{lead.callStartTime}</div>
                      <div className="mt-0.5 text-sm text-text-muted">Duration: {lead.callDuration}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {lead.applicationSubmitted ? (
                        <span className="inline-flex items-center rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm">
                          Application Submitted
                        </span>
                      ) : (
                        <button type="button" onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)} className="rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-all duration-150 hover:scale-105 hover:shadow">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle px-5 py-4">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold">{visible.length}</span> of <span className="font-semibold">12,493</span> entries
          </p>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm text-text-muted transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40">
              <ChevronLeft size={16} /> Prev
            </button>
            {pageNums.map((p, i) =>
              p === '…' ? (
                <span key={`ell-${i}`} className="px-2 text-sm text-text-muted">…</span>
              ) : (
                <button key={p} type="button" onClick={() => setCurrentPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium transition ${safePage === p ? 'bg-green-600 text-white' : 'border border-border-subtle bg-white text-text-muted hover:bg-slate-50'}`}>{p}</button>
              )
            )}
            <button type="button" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm text-text-muted transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showAdvFilters && <AdvancedFiltersPanel onClose={() => setShowAdvFilters(false)} />}
    </div>
  );
}

export default LeadCreation;
