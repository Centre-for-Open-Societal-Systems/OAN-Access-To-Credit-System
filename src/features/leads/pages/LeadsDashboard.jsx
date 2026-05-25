import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { kpiStats, leadRows as allLeads } from '../data/leads.mock.js';
import { PAGE_SIZE } from '../constants/leads.constants.js';
import LeadKpiCard from '../components/LeadKpiCard.jsx';
import LeadToolbar from '../components/LeadToolbar.jsx';
import LeadTable from '../components/LeadTable.jsx';
import LeadPagination from '../components/LeadPagination.jsx';
import LeadAdvancedFilters from '../components/LeadAdvancedFilters.jsx';







/* ─── LeadsDashboard ────────────────────────────────────────────────── */
function LeadsDashboard() {
  const navigate = useNavigate();

  const [search,            setSearch]           = useState('');
  const [activeTab,         setActiveTab]         = useState('all');
  const [statusFilter,      setStatusFilter]      = useState('All');
  const [dateFilter,        setDateFilter]        = useState('All Time');
  const [currentPage,       setCurrentPage]       = useState(1);
  const [showAdvFilters,    setShowAdvFilters]    = useState(false);
  const [selectedRows,      setSelectedRows]      = useState([]);
  const [openColFilter,     setOpenColFilter]     = useState(null);
  const [colStatusFilter,   setColStatusFilter]   = useState([]);
  const [colCallTimeFilter, setColCallTimeFilter] = useState([]);

  const myLeads         = useMemo(() => allLeads.filter(l => l.owner === 'me'),         []);
  const unassignedLeads = useMemo(() => allLeads.filter(l => l.owner === 'unassigned'), []);
  const baseLeads       = activeTab === 'my' ? myLeads : activeTab === 'unassigned' ? unassignedLeads : allLeads;

  /* live KPI counts computed from actual data */
  const liveKpiStats = useMemo(() => {
    const counts = {};
    allLeads.forEach(l => { counts[l.status.toLowerCase()] = (counts[l.status.toLowerCase()] || 0) + 1; });
    return kpiStats
      .filter(s => s.id !== 'disqualified')
      .map(s => ({
        ...s,
        display: s.id === 'total'
          ? allLeads.length.toLocaleString()
          : (counts[s.id] || 0).toLocaleString(),
      }));
  }, []);

  function parseCallDate(callStartTime) {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (callStartTime?.startsWith('Today'))     return new Date(today);
    if (callStartTime?.startsWith('Yesterday')) return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const match = callStartTime?.match(/^([A-Za-z]+ \d+)/);
    if (match) return new Date(`${match[1]}, ${today.getFullYear()}`);
    return null;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const daysMap = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'Last 90 Days': 90 };
    const filterDays = daysMap[dateFilter] ?? null;
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = filterDays ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - (filterDays - 1)) : null;

    return baseLeads.filter(l => {
      if (q && !`${l.id} ${l.phone} ${l.status} ${l.location}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (colStatusFilter.length > 0 && !colStatusFilter.includes(l.status)) return false;
      if (cutoff) {
        const leadDate = parseCallDate(l.callStartTime);
        if (!leadDate || leadDate < cutoff) return false;
      }
      if (colCallTimeFilter.length > 0) {
        const leadDate = parseCallDate(l.callStartTime ?? '');
        const t = l.callStartTime ?? '';
        const matches = colCallTimeFilter.some(period => {
          if (period === 'Today')       return t.startsWith('Today');
          if (period === 'Yesterday')   return t.startsWith('Yesterday');
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
  const safePage   = Math.min(currentPage, totalPages);
  const visible    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNums = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)              return [1, 2, 3, '…', totalPages];
    if (safePage >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', safePage - 1, safePage, safePage + 1, '…', totalPages];
  }, [safePage, totalPages]);

  const allChecked = visible.length > 0 && visible.every(l => selectedRows.includes(l.id + l.phone));
  const toggleAll  = () => setSelectedRows(allChecked ? [] : visible.map(l => l.id + l.phone));
  const toggleRow  = key => setSelectedRows(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

  const clearAllFilters = () => {
    setSearch(''); setStatusFilter('All'); setDateFilter('All Time');
    setColStatusFilter([]); setColCallTimeFilter([]); setCurrentPage(1);
  };

  return (
    <div className="space-y-4">

      {/* welcome header */}
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
            onClick={() => navigate('/new-lead-creation')}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-base font-semibold text-white transition hover:bg-green-700 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Lead
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {liveKpiStats.map((s, i) => <LeadKpiCard key={s.id} stat={s} index={i} />)}
      </div>

      {/* table card */}
      <div className="overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <LeadToolbar
          search={search}
          activeTab={activeTab}
          allLeadsCount={allLeads.length}
          myLeadsCount={myLeads.length}
          unassignedLeadsCount={unassignedLeads.length}
          dateFilter={dateFilter}
          onSearchChange={v => { setSearch(v); setCurrentPage(1); }}
          onTabChange={k => { setActiveTab(k); setCurrentPage(1); }}
          onDateChange={v => { setDateFilter(v); setCurrentPage(1); }}
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
          navigate={navigate}
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

export default LeadsDashboard;
