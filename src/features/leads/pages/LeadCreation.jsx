import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight,
  Download, Plus, X, Phone, TrendingUp, TrendingDown, Minus,
  Users, PhoneCall, CheckCircle2, UserX, ClipboardCheck, CircleAlert,
  Mail, Code2, Filter, Share2, MousePointer2, Terminal, Megaphone, Check,
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
const SOURCE_OPTS = ['All', 'Organic Search', 'Social Media', 'Referral', 'Direct Traffic', 'Email Campaign', 'API Integration'];
const CALLST_OPTS      = ['All', 'Connected', 'Missed', 'Callback'];
const DATE_OPTS        = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom Range'];
const LOAN_DETAIL_OPTS = ['All', 'Application Submitted', 'Under Review', 'Approved', 'Rejected', 'Disbursed'];
const PAGE_SIZE   = 10;

function getSourceIcon(source) {
  switch (source) {
    case 'Organic Search':  return <Search         size={16} className="text-slate-500" />;
    case 'Social Media':     return <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-[#0A66C2] text-[9px] font-bold leading-none text-white">in</span>;
    case 'Referral':        return <Share2          size={16} className="text-slate-500" />;
    case 'Direct Traffic':  return <MousePointer2   size={16} className="text-slate-400" />;
    case 'Email Campaign':  return <Mail            size={16} className="text-slate-500" />;
    case 'API Integration': return <Terminal        size={16} className="text-slate-500" />;
    default:                return <Megaphone       size={16} className="text-slate-400" />;
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

function StatusBadge({ status, delay, onClick, isActive }) {
  const cfg = STATUS_CFG[status] ?? { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span
      className={`animate-badge-pop inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition-all duration-150 ${cfg.badge} ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${isActive ? 'ring-2 ring-offset-1 ring-current' : ''}`}
      style={{ animationDelay: delay }}
      onClick={onClick}
    >
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function StatusTagPopup({ pos, selected, onToggle, onApply, onClose }) {
  const ref = useRef(null);
  const statuses = STATUS_OPTS.filter(s => s !== 'All');

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-52 rounded-xl border border-gray-200 bg-white shadow-xl animate-scale-in"
    >
      <div className="border-b border-gray-100 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Filter by Status</p>
      </div>
      <ul className="py-1">
        {statuses.map(s => {
          const sel = selected.includes(s);
          const cfg = STATUS_CFG[s];
          return (
            <li
              key={s}
              onMouseDown={e => { e.preventDefault(); onToggle(s); }}
              className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-gray-50 ${sel ? 'font-medium' : 'text-gray-700'}`}
            >
              <input
                type="checkbox"
                readOnly
                checked={sel}
                className="h-4 w-4 rounded border-gray-300 accent-green-600 pointer-events-none"
              />
              <span className={`h-2 w-2 shrink-0 rounded-full ${cfg?.dot ?? 'bg-slate-400'}`} />
              <span className={sel ? 'text-[#16A34A]' : ''}>{s}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <button type="button" onMouseDown={e => { e.preventDefault(); onApply([]); onClose(); }} className="text-xs font-medium text-gray-400 transition hover:text-red-500">Clear</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); onApply(selected); onClose(); }} className="rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#10883c]">Apply</button>
      </div>
    </div>
  );
}

function KpiCard({ stat, index }) {
  const cfg       = getKpiIconCfg(stat.id);
  const color     = stat.up === true ? 'text-green-600' : stat.up === false ? 'text-red-500' : 'text-orange-400';
  const TrendIcon = stat.up === true ? TrendingUp : stat.up === false ? TrendingDown : Minus;
  return (
    <div className="relative bg-white border border-[#e9e9e9] rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden flex items-start justify-between"
  
      
      
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

const COL_FILTER_OPTS = {
  'LEAD SOURCE':     SOURCE_OPTS.filter(o => o !== 'All'),
  'STATUS':          STATUS_OPTS.filter(o => o !== 'All'),
  'CALL START TIME': ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'],
};

function parseCallDate(callStartTime) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (callStartTime.startsWith('Today'))     return new Date(today);
  if (callStartTime.startsWith('Yesterday')) return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const match = callStartTime.match(/^([A-Za-z]+ \d+)/);
  if (match) return new Date(`${match[1]}, ${today.getFullYear()}`);
  return null;
}

function DateSelect({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);
  return (
    <div ref={ref} className="relative w-44">
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all focus:outline-none ${isOpen ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15' : 'border-gray-300 bg-white hover:border-[#4a7c59]/50'}`}
      >
        <span className="text-gray-900">{value}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#4a7c59]' : 'text-gray-400'}`} />
      </button>
      <ul
        className={`absolute right-0 z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-xl transition-all ${isOpen ? 'pointer-events-auto scale-y-100 opacity-100' : 'pointer-events-none scale-y-95 opacity-0'}`}
        style={{ transformOrigin: 'top' }}
      >
        {options.map(opt => {
          const sel = value === opt;
          return (
            <li
              key={opt}
              onMouseDown={() => { onChange(opt); setIsOpen(false); }}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${sel ? 'font-medium text-[#16A34A]' : 'text-gray-800 hover:bg-gray-50'}`}
            >
              {opt}
              {sel && <Check size={13} strokeWidth={2.5} className="text-[#4a7c59]" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ColFilterPopup({ col, anchorRef, initialSelected = [], onApply, onClose }) {
  const popupRef = useRef(null);
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorRef, onClose]);

  const opts = COL_FILTER_OPTS[col];
  const toggle = v => setSelected(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  return (
    <div
      ref={popupRef}
      className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-xl animate-scale-in"
      style={{ transformOrigin: 'top left' }}
    >
      <div className="border-b border-gray-100 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{col}</p>
      </div>

      {opts ? (
        <ul className="max-h-52 overflow-y-auto py-1">
          {opts.map(o => {
            const sel = selected.includes(o);
            return (
              <li
                key={o}
                onMouseDown={e => { e.preventDefault(); toggle(o); }}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={sel}
                  className="h-4 w-4 rounded border-gray-300 accent-green-600 pointer-events-none"
                />
                <span className={sel ? 'font-medium text-[#16A34A]' : 'text-gray-700'}>{o}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <Search size={14} className="shrink-0 text-text-muted" />
            <input
              type="text"
              autoFocus
              placeholder={`Search ${col.toLowerCase()}…`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <button type="button" onClick={() => { setSelected([]); setQuery(''); onApply([]); onClose(); }} className="text-xs font-medium text-gray-400 transition hover:text-red-500">Clear</button>
        <button type="button" onClick={() => { onApply(selected); onClose(); }} className="rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#10883c]">Apply</button>
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
  const [loanDetailFilter, setLoanDetailFilter] = useState('All');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [selectedRows,   setSelectedRows]   = useState([]);
  const [openColFilter,  setOpenColFilter]  = useState(null);
  const colFilterAnchorRefs = useRef({});
  const [colSourceFilter,   setColSourceFilter]   = useState([]);
  const [colStatusFilter,   setColStatusFilter]   = useState([]);
  const [colCallTimeFilter, setColCallTimeFilter] = useState([]);
  const [statusPopupPos,    setStatusPopupPos]    = useState(null);
  const [tempStatusSel,     setTempStatusSel]     = useState([]);
  const [activeTags,     setActiveTags]     = useState([
    { key: 'date',   label: 'Date: Last 30 Days'   },
    { key: 'status', label: 'Status: Not Rejected' },
  ]);

  const myLeads         = useMemo(() => allLeads.filter(l => l.owner === 'me'),         []);
  const unassignedLeads = useMemo(() => allLeads.filter(l => l.owner === 'unassigned'), []);
  const baseLeads       = activeTab === 'my' ? myLeads : activeTab === 'unassigned' ? unassignedLeads : allLeads;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const daysMap = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'Last 90 Days': 90 };
    const filterDays = daysMap[dateFilter] ?? null;
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = filterDays ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - (filterDays - 1)) : null;

    return baseLeads.filter(l => {
      if (q && !`${l.id} ${l.phone} ${l.source} ${l.status} ${l.location}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (sourceFilter !== 'All' && l.source !== sourceFilter) return false;
      if (colSourceFilter.length > 0 && !colSourceFilter.includes(l.source)) return false;
      if (colStatusFilter.length > 0 && !colStatusFilter.includes(l.status)) return false;
      if (cutoff) {
        const leadDate = parseCallDate(l.callStartTime);
        if (!leadDate || leadDate < cutoff) return false;
      }
      if (colCallTimeFilter.length > 0) {
        const t = l.callStartTime ?? '';
        const matches = colCallTimeFilter.some(period => {
          if (period === 'Today')     return t.startsWith('Today');
          if (period === 'Yesterday') return t.startsWith('Yesterday');
          return true;
        });
        if (!matches) return false;
      }
      return true;
    });
  }, [baseLeads, search, statusFilter, sourceFilter, dateFilter, colSourceFilter, colStatusFilter, colCallTimeFilter]);

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



      <div className="relative bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-between rounded-2xl border border-[#e9e9e9] bg-white px-6 py-5 shadow-sm">
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

      {/* search + table merged card */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white shadow-sm">

        {/* search row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-5 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-[#f4f4f4] px-4 py-2.5">
            <Search size={18} className="shrink-0 text-text-muted" />
            <input
              type="text"
              placeholder="Search by Lead ID or Phone Number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="min-w-0 flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          <button type="button" className="rounded-xl bg-[#16A34A] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#10883c] active:scale-95">Search</button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-[#16A34A] bg-[#EDFAF2] px-4 py-2 text-sm font-semibold text-[#16A34A] transition hover:bg-[#d6f5e5]">
            <ChevronDown size={14} strokeWidth={2.5} /> All Active (12k)
          </button>
          <button type="button" onClick={() => setShowAdvFilters(true)} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-slate-50">
            <SlidersHorizontal size={16} />
            Advanced Filters
          </button>
          <button type="button" onClick={() => { setStatusFilter('All'); setSourceFilter('All'); setCallStFilter('All'); setDateFilter('Last 30 Days'); setLoanDetailFilter('All'); setColSourceFilter([]); setColStatusFilter([]); setColCallTimeFilter([]); setActiveTags([]); setCurrentPage(1); }} className="text-sm font-semibold text-[#16A34A] transition hover:text-[#10883c]">
            Clear Filters
          </button>
        </div>

        {/* tabs row + date filter */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5">
          <div className="flex items-center gap-6">
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
          <div className="flex flex-row items-center gap-1 py-3 ">
            <span className="text-base font-medium text-text-muted">Date &nbsp;</span>
            <DateSelect
              value={dateFilter}
              options={DATE_OPTS}
              onChange={v => { setDateFilter(v); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border-subtle bg-slate-50">
                <th className="w-12 px-5 py-4">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded border-border-subtle accent-green-600" />
                </th>
                {['LEAD ID', 'PHONE NUMBER', 'LEAD SOURCE', 'STATUS', 'CALL START TIME', 'ACTIONS'].map(col => {
                  const hasFilter = !['LEAD ID', 'PHONE NUMBER', 'ACTIONS'].includes(col);
                  const colFilterCfg = {
                    'LEAD SOURCE':     { value: colSourceFilter,   set: setColSourceFilter   },
                    'STATUS':          { value: colStatusFilter,   set: setColStatusFilter   },
                    'CALL START TIME': { value: colCallTimeFilter, set: setColCallTimeFilter },
                  };
                  const isActive = hasFilter && (colFilterCfg[col]?.value.length > 0);
                  return (
                  <th key={col} className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-text-muted ${col === 'ACTIONS' ? 'text-left' : 'text-left'}`}>
                    {col !== 'ACTIONS' ? (
                      <div className="relative inline-flex items-center gap-1.5">
                        <span className="inline-flex cursor-pointer items-center gap-1 hover:text-text-primary">
                          {col} <span className="text-[11px]"></span>
                        </span>
                        {hasFilter && (
                          <>
                            <button
                              ref={el => { colFilterAnchorRefs.current[col] = { current: el }; }}
                              type="button"
                              onClick={() => setOpenColFilter(prev => prev === col ? null : col)}
                              className={`rounded p-0.5 transition hover:bg-slate-200 ${openColFilter === col || isActive ? 'bg-slate-200 text-green-600' : 'text-text-muted'}`}
                            >
                              <Filter size={12} strokeWidth={2.5} />
                            </button>
                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                            {openColFilter === col && (
                              <ColFilterPopup
                                col={col}
                                anchorRef={{ current: colFilterAnchorRefs.current[col]?.current }}
                                initialSelected={colFilterCfg[col]?.value ?? []}
                                onApply={colFilterCfg[col]?.set ?? (() => {})}
                                onClose={() => setOpenColFilter(null)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    ) : col}
                  </th>
                  );
                })}
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
                      <StatusBadge
                        status={lead.status}
                        delay={delay}
                        isActive={colStatusFilter.includes(lead.status)}
                        onClick={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTempStatusSel([...colStatusFilter]);
                          setStatusPopupPos({ top: rect.bottom + 6, left: rect.left });
                        }}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-text-primary">{lead.callStartTime}</div>
                      <div className="mt-0.5 text-sm text-text-muted">Duration: {lead.callDuration}</div>
                    </td>
                    <td className="px-5 py-4">
                      {lead.applicationSubmitted ? (
                        <span className="inline-flex items-center rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm">
                          Submitted
                        </span>
                      ) : (
                        <button type="button" onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)} className="inline-flex items-center rounded-lg border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-all duration-150 hover:scale-105 hover:shadow">
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

      {statusPopupPos && (
        <StatusTagPopup
          pos={statusPopupPos}
          selected={tempStatusSel}
          onToggle={s => setTempStatusSel(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
          onApply={sel => { setColStatusFilter(sel); setCurrentPage(1); }}
          onClose={() => setStatusPopupPos(null)}
        />
      )}
      {showAdvFilters && <AdvancedFiltersPanel onClose={() => setShowAdvFilters(false)} />}
    </div>
  );
}

export default LeadCreation;
