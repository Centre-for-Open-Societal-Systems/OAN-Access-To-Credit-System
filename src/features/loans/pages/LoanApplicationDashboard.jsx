import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListChecks,
  MapPin,
  Plus,
  Users,
  Wifi,
} from 'lucide-react';

import './LoanApplicationDashboard.module.scss';

const systemStatus = [
  { label: 'Network Status', value: 'Online', icon: Wifi, tone: 'success' },
  { label: 'Pending Sync', value: '0 items', icon: Clock3, tone: 'neutral' },
  { label: 'Location GPS', value: 'Active', icon: MapPin, tone: 'info' },
];

const metrics = [
  {
    label: 'Total Applications',
    value: '1,248',
    trend: '+12.5%',
    helper: 'vs last month',
    icon: CheckCircle2,
    tone: 'blue',
  },
  {
    label: 'Approved',
    value: '945',
    trend: '+18.3%',
    helper: 'vs last month',
    icon: CheckCircle2,
    tone: 'green',
  },
  {
    label: 'Pending Review',
    value: '87',
    trend: '+5.2%',
    helper: 'vs last month',
    icon: Clock3,
    tone: 'amber',
  },
  {
    label: 'Rejected',
    value: '216',
    trend: '-3.1%',
    helper: 'vs last month',
    icon: CircleAlert,
    tone: 'red',
  },
];

const activityRows = [
  {
    id: 'APP-8924',
    applicant: 'Tilahun Gessesse',
    type: 'Fertilizer Loan',
    status: 'Action Required',
    statusTone: 'danger',
    updated: '10 mins ago',
    action: 'Review',
  },
  {
    id: 'APP-8923',
    applicant: 'Aster Awoke',
    type: 'Equipment Financing',
    status: 'Pending Review',
    statusTone: 'info',
    updated: '2 hours ago',
    action: 'View',
  },
  {
    id: 'APP-8920',
    applicant: 'Mahmoud Ahmed',
    type: 'Seed Advance',
    status: 'Draft',
    statusTone: 'neutral',
    updated: 'Yesterday',
    action: 'Continue',
  },
  {
    id: 'APP-8921',
    applicant: 'Tigist Haile',
    type: 'Irrigation Pump',
    status: 'Action Required',
    statusTone: 'danger',
    updated: '1 day ago',
    action: 'Review',
  },
];

const notifications = [
  {
    title: 'Application Approved',
    description: 'Loan application for Yohannes Alemu has been approved by the bank.',
    time: '2 hours ago',
    icon: CheckCircle2,
    tone: 'success',
    highlight: false,
  },
  {
    title: 'New Lead Assigned',
    description: 'Supervisor assigned a new priority lead to your queue.',
    time: '5 hours ago',
    icon: Users,
    tone: 'info',
    highlight: true,
  },
  {
    title: 'Missing Documents',
    description: 'Application OAN-8799 requires updated land holding certificates.',
    time: '1 day ago',
    icon: CircleAlert,
    tone: 'warning',
    highlight: false,
  },
];

function LoanApplicationDashboard() {
  return (
    <>
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
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} className={`dashboard-card dashboard-metric-card dashboard-metric-card--${metric.tone}`}>
              <div className="dashboard-metric-card__top">
                <span className="dashboard-metric-card__label">{metric.label}</span>
                <span className={`dashboard-metric-card__icon dashboard-metric-card__icon--${metric.tone}`}>
                  <Icon size={22} strokeWidth={2} />
                </span>
              </div>

              <strong className="dashboard-metric-card__value">{metric.value}</strong>

              <div className="dashboard-metric-card__divider" />

              <p className={`dashboard-metric-card__trend dashboard-metric-card__trend--${metric.tone}`}>
                <ArrowUpRight size={14} strokeWidth={2.6} />
                <span>{metric.trend}</span>
                <span>{metric.helper}</span>
              </p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-panels-grid">
        <article id="dashboard-activity" className="dashboard-card dashboard-activity-card">
          <div className="dashboard-card__header dashboard-card__header--split">
            <h3>Recent Activity</h3>
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
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.map((row, index) => (
                  <tr key={`${row.id}-${row.applicant}-${index}`}>
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
        </article>

        <aside
          id="dashboard-notifications"
          className="dashboard-card dashboard-notifications-card"
        >
          <div className="dashboard-card__header dashboard-card__header--split">
            <h3>Notifications</h3>
            <button className="dashboard-link-button" type="button">
              View All
            </button>
          </div>

          <div className="dashboard-notification-list">
            {notifications.map((notification) => {
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
                    <span>{notification.time}</span>
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
