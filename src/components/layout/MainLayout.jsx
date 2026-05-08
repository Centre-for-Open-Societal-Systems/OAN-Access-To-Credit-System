import { useState } from 'react';
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
      { path: '/loans', label: 'Loan Application Dashboard', icon: FileText },
    ],
  },
  {
    title: 'WORKFLOW',
    items: [
      { path: '/leads/new', label: 'New Lead Creation', icon: Plus },
      { path: '/loans/new', label: 'New Loan Application Creation', icon: ListChecks },
      { path: '/loans/update-status', label: 'Update Loan Application Status', icon: Clock3 },
    ],
  },
];

const PAGE_TITLES = {
  '/leads': 'Leads Dashboard',
  '/leads/new': 'New Lead Creation',
  '/loans': 'Loan Application Dashboard',
  '/loans/new': 'New Loan Application Creation',
  '/loans/update-status': 'Update Loan Application Status',
};

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div
      id="dashboard-shell"
      className={`dashboard-shell ${isSidebarCollapsed ? 'dashboard-shell--collapsed' : ''}`}
    >
      <Sidebar isCollapsed={isSidebarCollapsed} sections={navigationSections} />
      <main id="dashboard-main" className="dashboard-main">
        <TopHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
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
