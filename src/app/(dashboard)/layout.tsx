'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Clock3, FileText, ListChecks, Plus, SquarePen, Users } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import '@/assets/styles/main-layout.scss';

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

const PAGE_TITLES: Record<string, string> = {
  '/leads-dashboard': 'Leads Dashboard',
  '/new-lead-creation': 'New Lead Creation',
  '/loans/loan-application-dashboard': 'Loan Application Dashboard',
  '/loans/new-loan-application-creation': 'New Loan Application Creation',
  '/loans/create-new-credit-request': 'Create New Credit Request',
  '/loans/update-loan-application-status': 'Update Loan Application Status',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Secure Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

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

  if (!isAuthenticated) {
    return null;
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
          onLogout={() => router.push('/login')}
          pageTitle={pageTitle}
        />
        <div id="dashboard-content" className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
