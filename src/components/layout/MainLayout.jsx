import { useEffect, useState } from 'react';
import { Clock3, FileText, ListChecks, Plus, Users } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import TopHeader from './TopHeader.jsx';

import './MainLayout.module.scss';

const navigationSections = [
  {
    title: 'DASHBOARDS',
    items: [
      { path: '/leads', label: 'Leads Dashboard', icon: Users },
      { path: '/loanApplicationDashboard', label: 'Loan Application Dashboard', icon: FileText },
    ],
  },
  {
    title: 'WORKFLOW',
    items: [
      { path: '/leads/new', label: 'New Lead Creation', icon: Plus },
      {
        path: '/loans/applications',
        activePaths: ['/loans/applications', '/loans/new'],
        label: 'New Loan Application Creation',
        icon: ListChecks,
      },
      { path: '/loans/update-status', label: 'Update Loan Application Status', icon: Clock3 },
    ],
  },
];

const PAGE_TITLES = {
  '/leads': 'Leads Dashboard',
  '/leads/new': 'New Lead Creation',
  '/loanApplicationDashboard': 'Loan Application Dashboard',
  '/loans/new': 'New Loan Application Creation',
  '/loans/applications': 'New Loan Application Creation',
  '/loans/update-status': 'Update Loan Application Status',
};

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  function handleToggleSidebar() {
    if (window.innerWidth <= 900) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  }

  return (
    <div
      id="dashboard-shell"
      className={`dashboard-shell ${isSidebarCollapsed ? 'dashboard-shell--collapsed' : ''}`}
    >
      {isMobileOpen && (
        <div
          className="dashboard-sidebar-overlay"
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileOpen} sections={navigationSections} />
      <main id="dashboard-main" className="dashboard-main">
        <TopHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onLogout={() => navigate('/login')}
          pageTitle={pageTitle}
        />
        <div id="dashboard-content" className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
