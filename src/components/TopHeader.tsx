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
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectOfficerName, selectOfficerRole } from '@/features/auth/store/authSlice';

import menuToggleArrow from './menu-toggle-arrow.svg';
import menuToggleBars from './menu-toggle-bars.svg';

import './TopHeader.module.scss'; // keyframe animations only

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

interface TopHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  pageTitle?: string;
}

function TopHeader({ isSidebarCollapsed, onToggleSidebar, onLogout, pageTitle = 'Dashboard' }: TopHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const rawOfficerName = useAppSelector(selectOfficerName);
  const rawOfficerRole = useAppSelector(selectOfficerRole);

  const officerName = rawOfficerName || 'Guest User';
  const officerRole = rawOfficerRole || 'Loan Officer';
  const initials = officerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'GU';

  useEffect(() => {
    const handleDocumentPointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
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
  const handleLogout = () => { closeProfileMenu(); onLogout?.(); };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 min-h-[3.7rem] px-5 py-3 border-b border-[rgba(22,32,51,0.08)] bg-white max-[640px]:px-[0.9rem]">

      {/* Left: menu toggle + page title */}
      <div className="inline-flex items-center gap-[0.65rem] min-w-0">
        <button
          type="button"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isSidebarCollapsed}
          onClick={onToggleSidebar}
          className="inline-grid h-[2.2rem] w-[2.2rem] place-items-center overflow-hidden text-text-primary shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,background-color,border-color] duration-150 hover:-translate-y-px active:scale-[0.96]"
        >
          <span className="relative block h-[1.4rem] w-[1.4rem]" aria-hidden="true">
            <img
              src={menuToggleBars.src || menuToggleBars}
              alt=""
              aria-hidden="true"
              className={[
                'absolute inset-0 h-full w-full object-contain',
                'transition-[opacity,transform] duration-[180ms] ease-in-out [will-change:opacity,transform]',
                isSidebarCollapsed
                  ? 'opacity-0 scale-[0.78] translate-x-[0.1rem] -rotate-[10deg]'
                  : 'opacity-100 scale-100 translate-x-0 rotate-0',
              ].join(' ')}
            />
            <img
              src={menuToggleArrow.src || menuToggleArrow}
              alt=""
              aria-hidden="true"
              className={[
                'absolute inset-0 h-full w-full object-contain',
                'transition-[opacity,transform] duration-[180ms] ease-in-out [will-change:opacity,transform]',
                isSidebarCollapsed
                  ? 'opacity-100 scale-100 translate-x-0 rotate-0'
                  : 'opacity-0 scale-[0.78] -translate-x-[0.1rem] rotate-0',
              ].join(' ')}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          title={pageTitle}
          className="border-0 bg-transparent p-0 max-w-[min(18rem,34vw)] max-[640px]:max-w-[12rem] overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold tracking-[-0.03em] text-text-primary"
        >
          {pageTitle}
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-[0.7rem] flex-wrap justify-end max-[640px]:gap-[0.45rem]">

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-[2.2rem] w-[2.2rem] items-center justify-center rounded-full border border-[rgba(22,32,51,0.08)] bg-white text-text-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          <Bell size={16} strokeWidth={2.3} />
          <span
            className="absolute right-[0.3rem] top-[0.32rem] h-[0.42rem] w-[0.42rem] rounded-full bg-[#ff3a3a] shadow-[0_0_0_2px_white]"
            aria-hidden="true"
          />
        </button>

        {/* Language selector */}
        <button
          type="button"
          aria-label="Language selector"
          className="relative inline-flex items-center gap-[0.4rem] rounded-full border border-[rgba(22,32,51,0.08)] bg-white px-3 py-2 text-[0.72rem] font-bold text-text-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          <Globe size={14} strokeWidth={2.3} />
          <span>English</span>
          <ChevronDown size={13} strokeWidth={2.3} className="flex-[0_0_auto] transition-transform duration-[180ms]" />
        </button>

        {/* Profile menu */}
        <div className="relative inline-flex flex-[0_0_auto]" ref={profileMenuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((v) => !v)}
            className={[
              'inline-flex items-center gap-[0.7rem] max-[640px]:gap-[0.55rem]',
              'min-h-[2.7rem] rounded-full py-[0.34rem] pl-[0.38rem] pr-3 max-[640px]:pr-[0.55rem]',
              'bg-[linear-gradient(180deg,#fff_0%,#fbfcfe_100%)] text-text-primary',
              'transition-[transform,box-shadow,border-color,background-color] duration-[160ms]',
              'hover:-translate-y-px hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]',
              isProfileMenuOpen
                ? 'border border-[rgba(23,53,95,0.22)] shadow-[0_12px_26px_rgba(15,23,42,0.12)]'
                : 'border border-[rgba(22,32,51,0.08)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
            ].join(' ')}
          >
            {/* Avatar with status dot */}
            <span
              className="relative grid h-[2.25rem] w-[2.25rem] flex-[0_0_auto] place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#f5b27d_0%,#c8642d_100%)] text-[0.72rem] font-bold tracking-[0.08em] text-white"
              aria-hidden="true"
            >
              {initials}
              <span
                className="absolute -right-[0.02rem] -top-[0.02rem] h-[0.58rem] w-[0.58rem] rounded-full border-2 border-white bg-[#38b869] animate-[dashboard-profile-status-pulse_2.3s_ease-in-out_infinite]"
                aria-hidden="true"
              />
            </span>

            {/* Name & role */}
            <span className="flex min-w-0 flex-col items-start gap-[0.08rem]">
              <strong className="text-[0.8rem] font-bold tracking-[-0.02em] text-text-primary">{officerName}</strong>
              <span className="text-[0.64rem] font-semibold text-text-muted max-[640px]:hidden">{officerRole}</span>
            </span>

            <ChevronDown
              size={13}
              strokeWidth={2.3}
              className={`flex-[0_0_auto] transition-transform duration-[180ms] ${isProfileMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown panel */}
          <div
            role="menu"
            aria-label="User profile actions"
            className={[
              'absolute right-0 top-[calc(100%+0.85rem)] z-20 overflow-hidden',
              'w-[19rem] max-w-[min(19rem,calc(100vw-1.2rem))] max-[640px]:w-[min(18rem,calc(100vw-1rem))]',
              'rounded-[1.15rem] border border-[rgba(22,32,51,0.08)] bg-white',
              'shadow-[0_24px_50px_rgba(15,23,42,0.16)] [transform-origin:top_right]',
              'transition-[opacity,transform,visibility] duration-200',
              isProfileMenuOpen
                ? 'opacity-100 pointer-events-auto scale-100 translate-y-0 visible animate-[dashboard-profile-panel-pop_240ms_cubic-bezier(0.2,0.9,0.25,1.1)_both]'
                : 'opacity-0 pointer-events-none scale-[0.96] -translate-y-[0.7rem] invisible',
            ].join(' ')}
          >
            {/* Panel header */}
            <div className="flex items-center gap-3 px-4 pb-[0.85rem] pt-4 bg-[linear-gradient(135deg,rgba(23,53,95,0.05),rgba(245,178,126,0.15))]">
              <div
                className="grid h-[2.7rem] w-[2.7rem] flex-[0_0_auto] place-items-center rounded-full bg-[linear-gradient(135deg,#f5b27d_0%,#c8642d_100%)] shadow-[0_14px_24px_rgba(200,100,45,0.22)] text-white text-[0.78rem] font-bold tracking-[0.08em]"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[0.12rem]">
                <strong className="text-[0.96rem] font-bold tracking-[-0.03em] text-text-primary">{officerName}</strong>
                <span className="text-[0.72rem] text-text-muted">{officerRole}</span>
              </div>
              <span className="self-start rounded-full bg-[rgba(56,184,105,0.14)] px-[0.45rem] py-[0.2rem] text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#2f9a58] max-[640px]:hidden">
                Online
              </span>
            </div>

            {/* Quick links */}
            <div className="flex flex-col gap-[0.2rem] px-[0.35rem] py-[0.2rem]">
              {profileQuickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={closeProfileMenu}
                    className="flex w-full items-center gap-[0.7rem] rounded-[0.85rem] border-0 bg-transparent px-3 py-[0.7rem] text-left text-[0.82rem] font-semibold text-text-primary transition-[transform,background-color,color] duration-150 hover:bg-[rgba(23,53,95,0.06)] hover:translate-x-[2px]"
                  >
                    <span
                      className="grid h-[1.55rem] w-[1.55rem] flex-[0_0_auto] place-items-center rounded-[0.55rem] bg-[rgba(23,53,95,0.08)] text-button"
                      aria-hidden="true"
                    >
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mx-[0.9rem] my-[0.2rem] h-px bg-[rgba(22,32,51,0.08)]" />

            {/* Actions (settings, lock screen) */}
            <div className="flex flex-col gap-[0.2rem] px-[0.35rem] py-[0.2rem]">
              {profileActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={closeProfileMenu}
                    className="flex w-full items-center gap-[0.7rem] rounded-[0.85rem] border-0 bg-transparent px-3 py-[0.7rem] text-left text-[0.82rem] font-semibold text-text-primary transition-[transform,background-color,color] duration-150 hover:bg-[rgba(23,53,95,0.06)] hover:translate-x-[2px]"
                  >
                    <span
                      className="grid h-[1.55rem] w-[1.55rem] flex-[0_0_auto] place-items-center rounded-[0.55rem] bg-[rgba(23,53,95,0.08)] text-button"
                      aria-hidden="true"
                    >
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto rounded-full bg-[rgba(56,184,105,0.14)] px-[0.38rem] py-[0.18rem] text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#2f9a58]">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mx-[0.9rem] my-[0.2rem] h-px bg-[rgba(22,32,51,0.08)]" />

            {/* Logout */}
            <div className="px-[0.35rem] pb-[0.35rem] pt-[0.2rem]">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-[0.7rem] rounded-[0.85rem] border-0 bg-transparent px-3 py-[0.7rem] text-left text-[0.82rem] font-semibold text-[#c23c31] transition-[transform,background-color,color] duration-150 hover:bg-[rgba(194,60,49,0.08)] hover:translate-x-[2px]"
              >
                <span
                  className="grid h-[1.55rem] w-[1.55rem] flex-[0_0_auto] place-items-center rounded-[0.55rem] bg-[rgba(194,60,49,0.1)] text-[#c23c31]"
                  aria-hidden="true"
                >
                  <LogOut size={15} strokeWidth={2.2} />
                </span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
