'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks'
import { ListChecks, Users, LayoutDashboard } from 'lucide-react';
import Sidebar, { NavSection } from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { logout as logoutAction } from '@/features/auth/store/authSlice';

import '@/styles/main-layout.scss';

const navigationSections: NavSection[] = [
  {
    title: 'DASHBOARDS',
    items: [
      { 
        path: '/leads',
        activePaths: ['/leads', '/leads/new'],
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
        path: '#', // Dynamically overridden in component
        label: 'New Loan Application',
        icon: ListChecks,
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/leads': 'Leads Pipeline',
  '/loans/new-loan-application': 'New Loan Application',
  '/leads/new': 'Create New Lead',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const activeItem = navigationSections
    .flatMap((section) => section.items)
    .find((item) => 
      item.path === pathname || 
      item.activePaths?.includes(pathname) || 
      (item.label === 'New Loan Application' && pathname.endsWith('/new-loan-application'))
    );

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

  const filteredNavigationSections = navigationSections.map(section => {
    if (section.title === 'WORKFLOW') {
      return {
        ...section,
        items: section.items.map(item => ({
          ...item,
          path: pathname.endsWith('/new-loan-application') ? pathname : item.path
        }))
      };
    }
    return section;
  }).filter(section => {
    if (section.title === 'WORKFLOW') {
      return pathname.endsWith('/new-loan-application');
    }
    return true;
  });

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
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileOpen} sections={filteredNavigationSections} />
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
