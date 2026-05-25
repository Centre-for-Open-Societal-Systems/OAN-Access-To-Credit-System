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
      { path: '/leads-dashboard', label: 'Leads Dashboard', icon: Users },
      { path: '/loans/loan-application-dashboard', label: 'Loan Application Dashboard', icon: FileText },
    ],
  },
  {
    title: 'WORKFLOW',
    items: [
      {
        path: '/new-lead-creation',
        activePaths: ['/new-lead-creation'],
        label: 'New Lead Creation',
        icon: Plus,
      },
      {
        path: '/loans/new-loan-application-creation',
        activePaths: ['/loans/new-loan-application-creation'],
        label: 'New Loan Application Creation',
        icon: ListChecks,
      },
      {
        path: '/loans/create-new-credit-request',
        label: 'Create New Credit Request',
        icon: SquarePen,
      },
      { path: '/loans/update-loan-application-status', label: 'Update Loan Application Status', icon: Clock3 },
    ],
  },
];

const PAGE_TITLES = {
  '/leads-dashboard': 'Leads Dashboard',
  '/new-lead-creation': 'New Lead Creation',
  '/loans/loan-application-dashboard': 'Loan Application Dashboard',
  '/loans/new-loan-application-creation': 'New Loan Application Creation',
  '/loans/create-new-credit-request': 'Create New Credit Request',
  '/loans/update-loan-application-status': 'Update Loan Application Status',
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
