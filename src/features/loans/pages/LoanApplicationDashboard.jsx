import { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Clock3,
  ClipboardList,
  Download,
  Filter,
  Globe,
  ListChecks,
  MapPin,
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
} from 'lucide-react';

import './LoanApplicationDashboard.module.scss';

const systemStatus = [
  { label: 'Network Status', value: 'Online', icon: Wifi, tone: 'success' },
  { label: 'Pending Sync', value: '0 items', icon: Clock3, tone: 'neutral' },
  { label: 'Location GPS', value: 'Active', icon: MapPin, tone: 'info' },
];

const METRIC_CONFIG = [
  { key: 'total',    label: 'Total Applications', helper: 'All loan types',     helperIcon: Globe,    icon: ClipboardList, tone: 'blue'  },
  { key: 'approved', label: 'Approved',            helper: 'Ready to disburse',  helperIcon: Tag,      icon: CheckCircle2,  tone: 'green' },
  { key: 'pending',  label: 'Pending Review',      helper: 'In this period',     helperIcon: Calendar, icon: Clock3,        tone: 'amber' },
  { key: 'rejected', label: 'Rejected',            helper: 'Needs attention',    helperIcon: Clock,    icon: CircleAlert,   tone: 'red'   },
];

const METRICS_BY_RANGE = {
  today:    { total: { value: '12',     trend: '+3',     dir: 'up'   }, approved: { value: '8',      trend: '+2',     dir: 'up'   }, pending: { value: '3',    trend: '+1',    dir: 'up'   }, rejected: { value: '1',     trend: '0%',     dir: 'up'   } },
  yesterday:{ total: { value: '18',     trend: '+5',     dir: 'up'   }, approved: { value: '11',     trend: '+3',     dir: 'up'   }, pending: { value: '5',    trend: '+2',    dir: 'up'   }, rejected: { value: '2',     trend: '0%',     dir: 'up'   } },
  last7:    { total: { value: '94',     trend: '+8.2%',  dir: 'up'   }, approved: { value: '67',     trend: '+11.4%', dir: 'up'   }, pending: { value: '18',   trend: '+3.1%', dir: 'up'   }, rejected: { value: '9',     trend: '-2.5%',  dir: 'down' } },
  last30:   { total: { value: '1,248',  trend: '+12.5%', dir: 'up'   }, approved: { value: '945',    trend: '+18.3%', dir: 'up'   }, pending: { value: '87',   trend: '+5.2%', dir: 'up'   }, rejected: { value: '216',   trend: '-3.1%',  dir: 'down' } },
  last3m:   { total: { value: '3,420',  trend: '+9.7%',  dir: 'up'   }, approved: { value: '2,601',  trend: '+14.2%', dir: 'up'   }, pending: { value: '234',  trend: '+4.8%', dir: 'up'   }, rejected: { value: '585',   trend: '-1.9%',  dir: 'down' } },
  last6m:   { total: { value: '6,890',  trend: '+11.3%', dir: 'up'   }, approved: { value: '5,210',  trend: '+15.7%', dir: 'up'   }, pending: { value: '398',  trend: '+3.2%', dir: 'up'   }, rejected: { value: '1,282', trend: '-2.4%',  dir: 'down' } },
  last1y:   { total: { value: '14,250', trend: '+14.8%', dir: 'up'   }, approved: { value: '10,890', trend: '+19.1%', dir: 'up'   }, pending: { value: '712',  trend: '+6.3%', dir: 'up'   }, rejected: { value: '2,648', trend: '-4.2%',  dir: 'down' } },
};

const activityRows = [
  {
    id: 'APP-8924',
    applicant: 'Tilahun Gessesse',
    type: 'Fertilizer Loan',
    status: ' Action Required',
    statusTone: 'danger',
    updated: 'May 9, 2026 · 10:14 AM',
    action: 'Review',
  },
  {
    id: 'APP-8923',
    applicant: 'Aster Awoke',
    type: 'Equipment Financing',
    status: 'Pending Review',
    statusTone: 'info',
    updated: 'May 9, 2026 · 08:30 AM',
    action: 'View',
  },
  {
    id: 'APP-8920',
    applicant: 'Mahmoud Ahmed',
    type: 'Seed Advance',
    status: 'Draft',
    statusTone: 'neutral',
    updated: 'May 8, 2026 · 03:45 PM',
    action: 'Continue',
  },
  {
    id: 'APP-8921',
    applicant: 'Tigist Haile',
    type: 'Irrigation Pump',
    status: 'Action Required',
    statusTone: 'danger',
    updated: 'May 8, 2026 · 11:00 AM',
    action: 'Review',
  },
  {
    id: 'APP-8918',
    applicant: 'Bekele Molla',
    type: 'Livestock Loan',
    status: 'Pending Review',
    statusTone: 'info',
    updated: 'May 7, 2026 · 02:15 PM',
    action: 'View',
  },
  {
    id: 'APP-8916',
    applicant: 'Hiwot Tadesse',
    type: 'Fertilizer Loan',
    status: 'Draft',
    statusTone: 'neutral',
    updated: 'May 7, 2026 · 09:50 AM',
    action: 'Continue',
  },
  {
    id: 'APP-8914',
    applicant: 'Solomon Kebede',
    type: 'Equipment Financing',
    status: 'Action Required',
    statusTone: 'danger',
    updated: 'May 6, 2026 · 04:30 PM',
    action: 'Review',
  },
  {
    id: 'APP-8911',
    applicant: 'Meron Alemu',
    type: 'Seed Advance',
    status: 'Pending Review',
    statusTone: 'info',
    updated: 'May 6, 2026 · 01:20 PM',
    action: 'View',
  },
  {
    id: 'APP-8908',
    applicant: 'Dawit Girma',
    type: 'Irrigation Pump',
    status: 'Draft',
    statusTone: 'neutral',
    updated: 'May 5, 2026 · 10:05 AM',
    action: 'Continue',
  },
  {
    id: 'APP-8905',
    applicant: 'Selamawit Tefera',
    type: 'Livestock Loan',
    status: 'Action Required',
    statusTone: 'danger',
    updated: 'May 5, 2026 · 08:45 AM',
    action: 'Review',
  },
  // April rows (last30, last3m, last6m, last1y)
  { id: 'APP-8902', applicant: 'Abebe Bikila',      type: 'Fertilizer Loan',      status: 'Pending Review',   statusTone: 'info',    updated: 'April 28, 2026 · 02:10 PM', action: 'View'     },
  { id: 'APP-8899', applicant: 'Liya Kebede',        type: 'Equipment Financing',  status: 'Action Required',  statusTone: 'danger',  updated: 'April 25, 2026 · 11:30 AM', action: 'Review'   },
  { id: 'APP-8895', applicant: 'Haile Gebrselassie', type: 'Seed Advance',         status: 'Draft',            statusTone: 'neutral', updated: 'April 20, 2026 · 09:00 AM', action: 'Continue' },
  { id: 'APP-8890', applicant: 'Birtukan Mideksa',   type: 'Irrigation Pump',      status: 'Pending Review',   statusTone: 'info',    updated: 'April 15, 2026 · 03:45 PM', action: 'View'     },
  { id: 'APP-8885', applicant: 'Kenenisa Bekele',    type: 'Livestock Loan',       status: 'Action Required',  statusTone: 'danger',  updated: 'April 10, 2026 · 01:20 PM', action: 'Review'   },
  { id: 'APP-8880', applicant: 'Almaz Meko',         type: 'Fertilizer Loan',      status: 'Draft',            statusTone: 'neutral', updated: 'April 5, 2026 · 10:50 AM',  action: 'Continue' },
  // March rows (last3m, last6m, last1y)
  { id: 'APP-8875', applicant: 'Yetnebersh Nigussie',type: 'Equipment Financing',  status: 'Pending Review',   statusTone: 'info',    updated: 'March 28, 2026 · 04:30 PM', action: 'View'     },
  { id: 'APP-8870', applicant: 'Tamrat Layne',        type: 'Seed Advance',         status: 'Action Required',  statusTone: 'danger',  updated: 'March 20, 2026 · 09:15 AM', action: 'Review'   },
  { id: 'APP-8865', applicant: 'Hiwot Fantaye',       type: 'Irrigation Pump',      status: 'Draft',            statusTone: 'neutral', updated: 'March 15, 2026 · 02:00 PM', action: 'Continue' },
  { id: 'APP-8860', applicant: 'Mulatu Astatke',      type: 'Livestock Loan',       status: 'Pending Review',   statusTone: 'info',    updated: 'March 5, 2026 · 11:40 AM',  action: 'View'     },
  // February rows (last6m, last1y)
  { id: 'APP-8855', applicant: 'Tsehay Haile',        type: 'Fertilizer Loan',      status: 'Action Required',  statusTone: 'danger',  updated: 'February 25, 2026 · 03:10 PM', action: 'Review'   },
  { id: 'APP-8850', applicant: 'Dereje Haile',         type: 'Equipment Financing',  status: 'Draft',            statusTone: 'neutral', updated: 'February 15, 2026 · 10:20 AM', action: 'Continue' },
  // January rows (last1y)
  { id: 'APP-8845', applicant: 'Emebet Girma',         type: 'Seed Advance',         status: 'Pending Review',   statusTone: 'info',    updated: 'January 20, 2026 · 01:00 PM', action: 'View'     },
  { id: 'APP-8840', applicant: 'Tesfaye Gebre',        type: 'Irrigation Pump',      status: 'Action Required',  statusTone: 'danger',  updated: 'January 10, 2026 · 09:30 AM', action: 'Review'   },
];

const allNotifications = [
  // Today
  { title: 'Application Approved',       description: 'Loan application for Yohannes Alemu has been approved by the bank.',        time: 'May 9, 2026 · 08:15 AM',          icon: CheckCircle2, tone: 'success', highlight: false },
  { title: 'New Lead Assigned',           description: 'Supervisor assigned a new priority lead to your queue.',                    time: 'May 9, 2026 · 06:40 AM',          icon: Users,        tone: 'info',    highlight: true  },
  // Yesterday
  { title: 'Missing Documents',           description: 'Application OAN-8799 requires updated land holding certificates.',           time: 'May 8, 2026 · 03:30 PM',          icon: CircleAlert,  tone: 'warning', highlight: false },
  { title: 'Review Deadline',             description: 'APP-8916 must be reviewed before end of business day.',                     time: 'May 8, 2026 · 09:00 AM',          icon: Clock,        tone: 'warning', highlight: false },
  // Last 7 days
  { title: 'New Application Submitted',   description: 'Meron Alemu submitted a new seed advance application for review.',          time: 'May 7, 2026 · 11:20 AM',          icon: ClipboardList,tone: 'info',    highlight: false },
  { title: 'Bulk Approval Completed',     description: '14 applications approved during the weekly review cycle.',                  time: 'May 5, 2026 · 02:00 PM',          icon: CheckCircle2, tone: 'success', highlight: false },
  // Last 30 days (April)
  { title: 'System Sync Complete',        description: 'Offline field records synced successfully to the central database.',        time: 'April 25, 2026 · 10:30 AM',       icon: Wifi,         tone: 'success', highlight: false },
  { title: 'Lead Queue Updated',          description: '7 new leads added to your queue from the field team.',                     time: 'April 22, 2026 · 09:15 AM',       icon: Users,        tone: 'info',    highlight: false },
  { title: 'Rejection Notice Sent',       description: 'APP-8800 rejected — incomplete collateral documentation provided.',         time: 'April 10, 2026 · 04:45 PM',       icon: CircleAlert,  tone: 'warning', highlight: false },
  // Last 3 months (March)
  { title: 'Monthly Target Reached',      description: 'March 2026 disbursement target achieved — 102% of goal met.',              time: 'March 31, 2026 · 05:00 PM',       icon: CheckCircle2, tone: 'success', highlight: false },
  { title: 'Policy Update',               description: 'New collateral thresholds for seed advance loans effective April 1.',       time: 'March 15, 2026 · 11:00 AM',       icon: ClipboardList,tone: 'info',    highlight: false },
  // Last 6 months (February)
  { title: 'Quarterly Review Complete',   description: 'Q1 2026 loan performance report has been published and shared.',            time: 'February 28, 2026 · 03:00 PM',    icon: ClipboardList,tone: 'info',    highlight: false },
  // Last year (January)
  { title: 'System Maintenance Done',     description: 'Scheduled maintenance completed — all services restored, no data loss.',   time: 'January 15, 2026 · 08:00 AM',     icon: Wifi,         tone: 'success', highlight: false },
];

const STATUS_OPTIONS = [
  { label: 'Action Required', value: 'danger' },
  { label: 'Pending Review', value: 'info' },
  { label: 'Draft', value: 'neutral' },
];

const PAGE_SIZE = 5;
const ALL_STATUS_VALUES = new Set(STATUS_OPTIONS.map((o) => o.value));

const DATE_RANGE_OPTIONS = [
  { label: 'Today',         value: 'today' },
  { label: 'Yesterday',     value: 'yesterday' },
  { label: 'Last 7 Days',   value: 'last7' },
  { label: 'Last 30 Days',  value: 'last30' },
  { label: 'Last 3 Months', value: 'last3m' },
  { label: 'Last 6 Months', value: 'last6m' },
  { label: 'Last Year',     value: 'last1y' },
];

function isRowInDateRange(row, range) {
  const datePart = row.updated.split(' · ')[0];
  const rowDate = new Date(datePart);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rowDay = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());

  switch (range) {
    case 'today':
      return rowDay.getTime() === today.getTime();
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return rowDay.getTime() === yesterday.getTime();
    }
    case 'last7': {
      const cutoff = new Date(today);
      cutoff.setDate(today.getDate() - 6);
      return rowDay >= cutoff;
    }
    case 'last30': {
      const cutoff = new Date(today);
      cutoff.setDate(today.getDate() - 29);
      return rowDay >= cutoff;
    }
    case 'last3m': {
      const cutoff = new Date(today);
      cutoff.setMonth(today.getMonth() - 3);
      return rowDay >= cutoff;
    }
    case 'last6m': {
      const cutoff = new Date(today);
      cutoff.setMonth(today.getMonth() - 6);
      return rowDay >= cutoff;
    }
    case 'last1y': {
      const cutoff = new Date(today);
      cutoff.setFullYear(today.getFullYear() - 1);
      return rowDay >= cutoff;
    }
    default:
      return true;
  }
}

function LoanApplicationDashboard() {
  const [activityPage, setActivityPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(ALL_STATUS_VALUES));
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState('last30');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const filterRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setDateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allChecked = selectedStatuses.size === STATUS_OPTIONS.length;

  function toggleStatus(value) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      if (next.size === 0) return new Set(ALL_STATUS_VALUES);
      return next;
    });
    setActivityPage(1);
  }

  function toggleAll() {
    if (allChecked) {
      // uncheck all individually, keep at least nothing selected → show all rows
      setSelectedStatuses(new Set());
    } else {
      setSelectedStatuses(new Set(ALL_STATUS_VALUES));
    }
    setActivityPage(1);
  }

  const rangeMetrics = METRICS_BY_RANGE[dateRange];
  const visibleNotifications = allNotifications.filter((n) => isRowInDateRange({ updated: n.time }, dateRange));
  const dateFilteredRows = activityRows.filter((r) => isRowInDateRange(r, dateRange));
  const filteredRows = selectedStatuses.size === 0 || allChecked
    ? dateFilteredRows
    : dateFilteredRows.filter((r) => selectedStatuses.has(r.statusTone));

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  const pagedRows = filteredRows.slice((activityPage - 1) * PAGE_SIZE, activityPage * PAGE_SIZE);

  const activeDateLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? 'Last 30 Days';

  return (
    <>
      <header className="dashboard-page-header">
        {/* <div className="dashboard-page-header__copy">
          <h1 className="dashboard-page-header__title">Loan Application Dashboard</h1>
          <p className="dashboard-page-header__subtitle">Manage and process your assigned agricultural loan leads.</p>
        </div> */}

        <div className="dashboard-page-header__actions">
          <div className="dashboard-date-filter" ref={dateRef}>
            <button
              className={`dashboard-date-filter__btn${dateDropdownOpen ? ' dashboard-date-filter__btn--open' : ''}`}
              type="button"
              onClick={() => setDateDropdownOpen((o) => !o)}
            >
              {activeDateLabel}
              <ChevronDown size={14} strokeWidth={2.5} />
            </button>

            {dateDropdownOpen && (
              <div className="dashboard-date-filter__dropdown">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`dashboard-date-filter__option${dateRange === opt.value ? ' dashboard-date-filter__option--active' : ''}`}
                    onClick={() => { setDateRange(opt.value); setDateDropdownOpen(false); setActivityPage(1); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="dashboard-export-btn" type="button">
            <Download size={14} strokeWidth={2.5} />
            Export
          </button>
        </div>
      </header>

      <section id="dashboard-hero" className="dashboard-hero-grid">
        <article className="dashboard-card dashboard-welcome-card">
          <div className="dashboard-welcome-card__content">
            <h2>Loan Application Dashboard</h2>
            <p>Review active applications, approvals, and progress status.</p>

            <div className="dashboard-welcome-card__actions">
              <button className="dashboard-button dashboard-button--primary" type="button">
                <Plus size={15} strokeWidth={2.5} />
                <span>Start New Application</span>
              </button>

              <button className="dashboard-button dashboard-button--secondary" type="button">
                <ListChecks size={15} strokeWidth={2.5} />
                <span>View My Queue</span>
              </button>
            </div>
          </div>
        </article>

        <aside className="dashboard-card dashboard-status-card">
          <div className="dashboard-card__header">
            <h3>System Status</h3>
          </div>

          <div className="dashboard-status-list">
            {systemStatus.map((status) => {
              const Icon = status.icon;

              return (
                <div key={status.label} className="dashboard-status-row">
                  <div className="dashboard-status-row__copy">
                    <span className="dashboard-status-row__icon" aria-hidden="true">
                      <Icon size={13} strokeWidth={2.4} />
                    </span>
                    <span>{status.label}</span>
                  </div>
                  <span className={`dashboard-status-pill dashboard-status-pill--${status.tone}`}>
                    {status.value}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section id="dashboard-metrics" className="dashboard-metrics-grid">
        {METRIC_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          const HelperIcon = cfg.helperIcon;
          const stat = rangeMetrics[cfg.key];
          const TrendIcon = stat.dir === 'up' ? TrendingUp : TrendingDown;

          return (
            <article key={cfg.label} className="dashboard-card kpi-card">
              <span className={`kpi-card__trend-badge kpi-card__trend-badge--${stat.dir}`}>
                <TrendIcon size={11} strokeWidth={2.5} />
                {stat.trend}
              </span>

              <div className="kpi-card__body">
                <div className={`kpi-card__icon-box kpi-card__icon-box--${cfg.tone}`}>
                  <Icon size={36} strokeWidth={1.6} />
                </div>

                <div className="kpi-card__text">
                  <strong className="kpi-card__value">{stat.value}</strong>
                  <span className="kpi-card__label">{cfg.label}</span>
                </div>
              </div>

              <div className="kpi-card__helper">
                <HelperIcon size={12} strokeWidth={2} />
                <span>{cfg.helper}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-panels-grid">
        <article id="dashboard-activity" className="dashboard-card dashboard-activity-card">
          <div className="dashboard-card__header dashboard-card__header--split">
            <h3>
              <span className="dashboard-card__header-icon dashboard-card__header-icon--blue">
                <Activity size={15} strokeWidth={2.2} />
              </span>
              Recent Activity
            </h3>
            <button className="dashboard-link-button" type="button">
              View All
            </button>
          </div>

          <div className="dashboard-activity-table-wrap">
            <table className="dashboard-activity-table">
              <thead>
                <tr>
                  <th>Application ID / Applicant</th>
                  <th>Type</th>
                  <th>
                    <div className="dashboard-th-filter" ref={filterRef}>
                      <span>Status</span>
                      <button
                        className={`dashboard-th-filter__btn${filterOpen ? ' dashboard-th-filter__btn--active' : ''}${!allChecked ? ' dashboard-th-filter__btn--set' : ''}`}
                        type="button"
                        aria-label="Filter by status"
                        onClick={() => setFilterOpen((o) => !o)}
                      >
                        <Filter size={12} strokeWidth={2.5} />
                      </button>

                      {filterOpen && (
                        <div className="dashboard-filter-dropdown" role="listbox" aria-label="Filter options" aria-multiselectable="true">
                          {/* All row */}
                          <button
                            type="button"
                            role="option"
                            aria-selected={allChecked}
                            className={`dashboard-filter-option${allChecked ? ' dashboard-filter-option--active' : ''}`}
                            onClick={toggleAll}
                          >
                            <span className={`dashboard-filter-checkbox${allChecked ? ' dashboard-filter-checkbox--checked' : ''}`} aria-hidden="true">
                              {allChecked && <Check size={9} strokeWidth={3} />}
                            </span>
                            All
                          </button>

                          {STATUS_OPTIONS.map((opt) => {
                            const isChecked = selectedStatuses.has(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={isChecked}
                                className={`dashboard-filter-option${isChecked ? ' dashboard-filter-option--active' : ''}`}
                                onClick={() => toggleStatus(opt.value)}
                              >
                                <span className={`dashboard-filter-checkbox${isChecked ? ' dashboard-filter-checkbox--checked' : ''}`} aria-hidden="true">
                                  {isChecked && <Check size={9} strokeWidth={3} />}
                                </span>
                                <span className={`dashboard-filter-dot dashboard-filter-dot--${opt.value}`} aria-hidden="true" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr><td colSpan={5} className="dashboard-empty-state">No applications found for this period.</td></tr>
                ) : pagedRows.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>
                      <strong>{row.id}</strong>
                      <span>{row.applicant}</span>
                    </td>
                    <td>{row.type}</td>
                    <td>
                      <span className={`dashboard-badge dashboard-badge--${row.statusTone}`}>
                        <span className="dashboard-badge__dot" aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                    <td>{row.updated}</td>
                    <td>
                      <button className="dashboard-mini-button" type="button">
                        {row.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="dashboard-pagination">
              <span className="dashboard-pagination__info">
                Page {activityPage} of {totalPages}
              </span>
              <div className="dashboard-pagination__controls">
                <button
                  className="dashboard-pagination__btn"
                  type="button"
                  disabled={activityPage === 1}
                  onClick={() => setActivityPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    className={`dashboard-pagination__btn dashboard-pagination__btn--page${
                      pg === activityPage ? ' dashboard-pagination__btn--active' : ''
                    }`}
                    type="button"
                    onClick={() => setActivityPage(pg)}
                    aria-current={pg === activityPage ? 'page' : undefined}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  className="dashboard-pagination__btn"
                  type="button"
                  disabled={activityPage === totalPages}
                  onClick={() => setActivityPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </article>

        <aside
          id="dashboard-notifications"
          className="dashboard-card dashboard-notifications-card"
        >
          <div className="dashboard-card__header dashboard-card__header--split">
            <h3>
              <span className="dashboard-card__header-icon dashboard-card__header-icon--amber">
                <Bell size={15} strokeWidth={2.2} />
              </span>
              Notifications
            </h3>
            <button className="dashboard-link-button" type="button">
              View All
            </button>
          </div>

          <div className="dashboard-notification-list">
            {visibleNotifications.length === 0 ? (
              <p className="dashboard-empty-state">No notifications for this period.</p>
            ) : visibleNotifications.map((notification) => {
              const Icon = notification.icon;

              return (
                <article
                  key={notification.title}
                  className="dashboard-notification-item"
                  data-highlight={notification.highlight ? 'true' : 'false'}
                >
                  <span
                    className={`dashboard-notification-item__icon dashboard-notification-item__icon--${notification.tone}`}
                  >
                    <Icon size={14} strokeWidth={2.4} />
                  </span>

                  <div className="dashboard-notification-item__copy">
                    <strong>{notification.title}</strong>
                    <p>{notification.description}</p>
                    <span className="dashboard-notification-item__time">
                      <Calendar size={11} strokeWidth={2} />
                      {notification.time}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </>
  );
}

export default LoanApplicationDashboard;
