import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Globe,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Settings,
  UserRound,
  Wallet,
} from 'lucide-react';

import menuToggleArrow from './menu-toggle-arrow.svg';
import menuToggleBars from './menu-toggle-bars.svg';

import './TopHeader.module.scss';

const profileQuickLinks = [
  { label: 'Profile', icon: UserRound },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Taskboard', icon: ClipboardList },
  { label: 'Help', icon: CircleHelp },
];

const profileActions = [
  { label: 'Settings', icon: Settings, badge: 'New' },
  { label: 'Lock screen', icon: LockKeyhole },
];

function TopHeader({ isSidebarCollapsed, onToggleSidebar, onLogout, pageTitle = 'Dashboard' }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleDocumentPointerDown = (event) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleDocumentKeyDown = (event) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, []);

  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  const handleLogout = () => {
    closeProfileMenu();
    onLogout?.();
  };

  return (
    <header id="dashboard-topbar" className="dashboard-topbar">
      <div className="dashboard-topbar__title-group">
        <button
          className="dashboard-topbar__menu-toggle"
          type="button"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isSidebarCollapsed}
          data-sidebar-collapsed={isSidebarCollapsed ? 'true' : 'false'}
          onClick={onToggleSidebar}
        >
          <span className="dashboard-topbar__menu-toggle-icon" aria-hidden="true">
            <img
              className="dashboard-topbar__menu-toggle-icon-image dashboard-topbar__menu-toggle-icon-image--bars"
              src={menuToggleBars}
              alt=""
              aria-hidden="true"
            />
            <img
              className="dashboard-topbar__menu-toggle-icon-image dashboard-topbar__menu-toggle-icon-image--arrow"
              src={menuToggleArrow}
              alt=""
              aria-hidden="true"
            />
          </span>
        </button>

        <button
          className="dashboard-topbar__title-button"
          type="button"
          onClick={onToggleSidebar}
          title={pageTitle}
        >
          {pageTitle}
        </button>
      </div>

      <div className="dashboard-topbar__actions">
        <button className="dashboard-topbar__icon-button" type="button" aria-label="Notifications">
          <Bell size={16} strokeWidth={2.3} />
          <span className="dashboard-topbar__dot" aria-hidden="true" />
        </button>

        <button className="dashboard-topbar__language" type="button" aria-label="Language selector">
          <Globe size={14} strokeWidth={2.3} />
          <span>English</span>
          <ChevronDown
            className="dashboard-topbar__dropdown-chevron dashboard-topbar__dropdown-chevron--language"
            size={13}
            strokeWidth={2.3}
          />
        </button>

        <div className="dashboard-topbar__profile-menu" ref={profileMenuRef}>
          <button
            className="dashboard-topbar__profile-button"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            data-open={isProfileMenuOpen ? 'true' : 'false'}
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          >
            <span className="dashboard-topbar__profile-avatar" aria-hidden="true">
              DT
              <span className="dashboard-topbar__profile-status" aria-hidden="true" />
            </span>

            <span className="dashboard-topbar__profile-copy">
              <strong>Dawit Tadesse</strong>
              <span>Loan Officer</span>
            </span>

            <ChevronDown
              className="dashboard-topbar__dropdown-chevron dashboard-topbar__dropdown-chevron--profile"
              size={13}
              strokeWidth={2.3}
            />
          </button>

          <div
            className="dashboard-topbar__profile-panel"
            data-open={isProfileMenuOpen ? 'true' : 'false'}
            role="menu"
            aria-label="User profile actions"
          >
            <div className="dashboard-topbar__profile-panel-header">
              <div className="dashboard-topbar__profile-panel-avatar" aria-hidden="true">DT</div>
              <div className="dashboard-topbar__profile-panel-copy">
                <strong>Dawit Tadesse</strong>
                <span>Loan Officer</span>
              </div>
              <span className="dashboard-topbar__profile-panel-status">Online</span>
            </div>

            <div className="dashboard-topbar__profile-panel-list">
              {profileQuickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="dashboard-topbar__profile-panel-item"
                    type="button"
                    role="menuitem"
                    onClick={closeProfileMenu}
                  >
                    <span className="dashboard-topbar__profile-panel-item-icon" aria-hidden="true">
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="dashboard-topbar__profile-panel-divider" />

            <div className="dashboard-topbar__profile-panel-list">
              {profileActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="dashboard-topbar__profile-panel-item"
                    type="button"
                    role="menuitem"
                    onClick={closeProfileMenu}
                  >
                    <span className="dashboard-topbar__profile-panel-item-icon" aria-hidden="true">
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="dashboard-topbar__profile-panel-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="dashboard-topbar__profile-panel-divider" />

            <button
              className="dashboard-topbar__profile-panel-item dashboard-topbar__profile-panel-item--danger"
              type="button"
              role="menuitem"
              onClick={handleLogout}
            >
              <span className="dashboard-topbar__profile-panel-item-icon" aria-hidden="true">
                <LogOut size={15} strokeWidth={2.2} />
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
