import { useEffect, useState } from 'react';
import { Clock3, FileText, ListChecks, Plus, SquarePen, Users } from 'lucide-react';
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
      {
        path: '/leads/lead',
        activePaths: ['/leads/lead', '/leads/new'],
        label: 'New Lead Creation',
        icon: Plus,
      },
      {
        path: '/loans/applications',
        activePaths: ['/loans/applications', '/loans/lead', '/loans/new'],
        label: 'New Loan Application Creation',
        icon: ListChecks,
      },
      {
        path: '/loans/credit-request',
        label: 'Create New Credit Request',
        icon: SquarePen,
      },
      { path: '/loans/update-status', label: 'Update Loan Application Status', icon: Clock3 },
    ],
  },
];

const PAGE_TITLES = {
  '/leads': 'Leads Dashboard',
  '/leads/lead': 'Lead Creation',
  '/loanApplicationDashboard': 'Loan Application Dashboard',
  '/loans/lead': 'Loan Application Creation',
  '/loans/applications': 'Loan Application Creation',
  '/loans/credit-request': 'Create New Credit Request',
  '/loans/update-status': 'Update Loan Application Status',
};

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  // Update document/tab title on route change
  useEffect(() => {
    document.title = `${pageTitle} | Open AgriNet`;
  }, [pageTitle]);

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
