'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ListChecks, Users, LayoutDashboard, type LucideIcon } from 'lucide-react';
import Sidebar, { NavSection } from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { selectIsAuthenticated, logout as logoutAction } from '@/features/auth/store/authSlice';

import '@/styles/main-layout.scss';

const navigationSections: NavSection[] = [
  {
    title: 'DASHBOARDS',
    items: [
      { 
        path: '/leads-dashboard',
        activePaths: ['/leads-dashboard', '/leads-application'],
        label: 'Leads Dashboard', 
        icon: Users 
      },
      { 
        path: '/loan-application-dashboard',
        activePaths: ['/loan-application-dashboard'],
        label: 'Loans Dashboard', 
        icon: LayoutDashboard 
      },
    ],
  },
  {
    title: 'WORKFLOW',
    items: [
      {
        path: '/loans/new-loan-application',
        activePaths: ['/loans/new-loan-application'],
        label: 'New Loan Application',
        icon: ListChecks,
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/leads-dashboard': 'Leads Dashboard',
  '/loans/new-loan-application': 'New Loan Application',
  '/leads-application': 'Create New Lead',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const activeItem = navigationSections
    .flatMap((section) => section.items)
    .find((item) => item.path === pathname || item.activePaths?.includes(pathname));

  const pageTitle = activeItem?.label ?? PAGE_TITLES[pathname] ?? 'Dashboard';



  // update the title of the page
  useEffect(() => {
    document.title = `${pageTitle} | Open AgriNet`;
  }, [pageTitle]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

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
          onLogout={async () => {
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
            dispatch(logoutAction());
            router.push('/login');
          }}
          pageTitle={pageTitle}
        />
        <div id="dashboard-content" className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
