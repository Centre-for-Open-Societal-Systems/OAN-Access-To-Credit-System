import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Database,
  Globe,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Settings,
  UserRound,
  Languages,
  Check,
} from 'lucide-react';
import { selectOfficerName, selectOfficerRole } from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
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

const mockNotifications = [
  {
    id: 1,
    icon: UserRound,
    iconColor: 'text-[#3b82f6]',
    iconBg: 'bg-[#eff6ff]',
    title: 'New farmer registration',
    description: 'Abebe Kebede registered in Addis Ababa',
    subDescription: 'Abebe Kebede is a resident of Addis Ababa',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    icon: Database,
    iconColor: 'text-[#16a34a]',
    iconBg: 'bg-[#f0fdf4]',
    title: 'Data import complete',
    description: '500 records imported successfully',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: 3,
    icon: Database,
    iconColor: 'text-[#16a34a]',
    iconBg: 'bg-[#f0fdf4]',
    title: 'System update',
    description: 'New features available in Reports module',
    time: '1 day ago',
    unread: true,
  }
];

interface TopHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  pageTitle?: string;
}

function TopHeader({ isSidebarCollapsed, onToggleSidebar, onLogout, pageTitle = 'Dashboard' }: TopHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notifications, setNotifications] = useState(mockNotifications);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const rawOfficerName = useAppSelector(selectOfficerName);
  const rawOfficerRole = useAppSelector(selectOfficerRole);

  const officerName = rawOfficerName || 'Guest User';
  const officerRole = rawOfficerRole || 'Loan Officer';
  const initials = officerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'GU';

  useEffect(() => {
    const handleDocumentPointerDown = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
      }
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
      <div className="inline-flex items-center gap-[0.65rem] min-w-0 font-bold">
        <button
          type="button"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isSidebarCollapsed}
          onClick={onToggleSidebar}
          className="inline-grid h-[2.2rem] w-[2.2rem] place-items-center overflow-hidden text-text-primary shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,background-color,border-color] duration-150 hover:-translate-y-px active:scale-[0.96]"
        >
          <span className="relative block h-[1.4rem] w-[1.4rem]" aria-hidden="true">
            <Image
              src={menuToggleBars}
              alt=""
              width={22}
              height={22}
              aria-hidden="true"
              className={[
                'absolute inset-0 h-full w-full object-contain',
                'transition-[opacity,transform] duration-[180ms] ease-in-out [will-change:opacity,transform]',
                isSidebarCollapsed
                  ? 'opacity-0 scale-[0.78] translate-x-[0.1rem] -rotate-[10deg]'
                  : 'opacity-100 scale-100 translate-x-0 rotate-0',
              ].join(' ')}
            />
            <Image
              src={menuToggleArrow}
              alt=""
              width={22}
              height={22}
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
        <span className="flex items-center gap-1.5 rounded-md border border-green-200 bg-[#f0fdf4] px-2 py-0.5 text-xs font-bold text-[#16A34A] whitespace-nowrap shrink-0">
          LD-9822
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-[0.7rem] justify-end max-[640px]:gap-[0.45rem] shrink-0">

        {/* Notifications */}
        <div className="relative inline-flex" ref={notificationsRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((v) => !v)}
            className={`relative inline-flex h-[2.2rem] w-[2.2rem] items-center justify-center rounded-full border transition-[transform,box-shadow,border-color,background-color] duration-[160ms] hover:-translate-y-px hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)] ${isNotificationsOpen ? 'border-[rgba(23,53,95,0.22)] shadow-[0_12px_26px_rgba(15,23,42,0.12)] bg-[linear-gradient(180deg,#fff_0%,#fbfcfe_100%)] text-text-primary' : 'border-[rgba(22,32,51,0.08)] bg-white text-text-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)]'}`}
          >
            <Bell size={16} strokeWidth={2.3} />
            {unreadCount > 0 && (
              <span
                className="absolute -right-[0.15rem] -top-[0.15rem] flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-[#ef4444] px-[0.25rem] text-[0.65rem] font-bold text-white shadow-[0_0_0_2px_white]"
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <div
            role="menu"
            aria-label="Notifications"
            className={[
              'absolute right-0 top-[calc(100%+0.85rem)] z-20 overflow-hidden',
              'w-[24rem] max-w-[min(24rem,calc(100vw-1.2rem))] max-[640px]:w-[min(22rem,calc(100vw-1rem))]',
              'rounded-[1.15rem] border border-[rgba(22,32,51,0.08)] bg-white',
              'shadow-[0_24px_50px_rgba(15,23,42,0.16)] [transform-origin:top_right]',
              'transition-[opacity,transform,visibility] duration-200',
              isNotificationsOpen
                ? 'opacity-100 pointer-events-auto scale-100 translate-y-0 visible animate-[dashboard-profile-panel-pop_240ms_cubic-bezier(0.2,0.9,0.25,1.1)_both]'
                : 'opacity-0 pointer-events-none scale-[0.96] -translate-y-[0.7rem] invisible',
            ].join(' ')}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(22,32,51,0.08)]">
              <h3 className="text-[1.1rem] font-bold text-gray-800 tracking-[-0.02em]">Notifications</h3>
              <button
                onClick={handleMarkAllAsRead}
                className="text-[0.8rem] font-bold text-[#16a34a] hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
            <div className="flex flex-col max-h-[65vh] overflow-y-auto">
              {notifications.map((notif, index) => (
                <div key={notif.id} className={`flex gap-4 p-5 ${index !== notifications.length - 1 ? 'border-b border-[rgba(22,32,51,0.05)]' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <div className={`grid h-[2.5rem] w-[2.5rem] shrink-0 place-items-center rounded-full ${notif.iconBg} ${notif.iconColor}`}>
                    <notif.icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 pt-[0.1rem]">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className="text-[0.95rem] font-bold text-[#202c45] tracking-[-0.01em]">{notif.title}</p>
                      {notif.unread && (
                        <div className="h-2 w-2 rounded-full bg-[#ef4444] mt-1 shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-[0.85rem] text-[#4b5563] leading-snug">{notif.description}</p>
                      {notif.subDescription && (
                        <p className="text-[0.85rem] text-[#4b5563] leading-snug">{notif.subDescription}</p>
                      )}
                    </div>
                    <p className="text-[0.75rem] font-medium text-[#9ca3af]">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language selector (Hidden on mobile, moved to profile dropdown) */}
        <div className="hidden sm:inline-flex relative items-center p-[0.2rem] rounded-[1.5rem] border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setSelectedLanguage('EN')}
            className={`flex items-center gap-[0.35rem] px-3 py-[0.35rem] rounded-full font-bold text-[0.85rem] transition-colors ${selectedLanguage === 'EN'
              ? 'bg-[#fbbf24] text-[#1e293b]'
              : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            <Globe size={16} strokeWidth={2.3} />
            EN
          </button>

          <button
            type="button"
            onClick={() => setSelectedLanguage('AM')}
            className={`flex items-center gap-[0.35rem] px-3 py-[0.35rem] rounded-full font-bold text-[0.85rem] transition-colors ${selectedLanguage === 'AM'
              ? 'bg-[#fbbf24] text-[#1e293b]'
              : 'text-[#14532d] hover:bg-gray-100'
              }`}
          >
            <Languages size={16} strokeWidth={2.3} className="text-[#14532d]" />
            አማ
          </button>
        </div>

        {/* Profile menu */}
        <div className="relative inline-flex flex-[0_0_auto]" ref={profileMenuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((v) => !v)}
            className={[
              'group inline-flex items-center gap-2 sm:gap-2.5',
              'rounded-[1.5rem] py-1 pl-1 pr-2.5 sm:py-2 sm:pl-1 sm:pr-3.5',
              'bg-white border border-gray-200',
              'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
              'transition-all duration-300 ease-out',
              'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] hover:border-gray-300',
              isProfileMenuOpen ? 'border-gray-300 shadow-[0_4px_12px_rgba(0,0,0,0.08)] -translate-y-[2px]' : ''
            ].join(' ')}
          >
            {/* Avatar with animated green ring */}
            <div className="relative h-9 w-9 shrink-0">
              {/* Animated pulse ring */}
              <div className="absolute inset-0 rounded-full border-[2px] border-[#10b981] animate-ping opacity-25" style={{ animationDuration: '2s' }} />
              <div className="relative h-full w-full rounded-full border-[2px] border-[#10b981] overflow-hidden flex items-center justify-center bg-gray-100 z-10 transition-transform duration-300 group-hover:scale-[1.05]">
                <Image
                  src="/avatar.png"
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover hidden"
                  onLoad={(e) => {
                    e.currentTarget.classList.remove('hidden');
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.classList.add('hidden');
                  }}
                />
                <span className="flex h-full w-full items-center justify-center text-[0.8rem] font-bold text-gray-500 bg-gray-100">
                  {initials}
                </span>
              </div>
            </div>

            {/* Name & role (Hidden on mobile) */}
            <div className="hidden sm:flex flex-col items-start min-w-0 pr-1">
              <span className="text-[0.9rem] font-bold text-gray-900 leading-tight tracking-tight">{officerName}</span>
              <span className="text-[0.75rem] text-gray-500 font-medium leading-tight">ID: {officerRole}</span>
            </div>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown panel */}
          <div
            role="menu"
            aria-label="User profile actions"
            className={[
              'absolute right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden',
              'w-[13.5rem]',
              'rounded-xl border border-gray-100 bg-white',
              'shadow-[0_10px_25px_rgba(0,0,0,0.1)] [transform-origin:top_right]',
              'transition-[opacity,transform,visibility] duration-200',
              isProfileMenuOpen
                ? 'opacity-100 pointer-events-auto scale-100 translate-y-0 visible'
                : 'opacity-0 pointer-events-none scale-[0.96] -translate-y-[0.5rem] invisible',
            ].join(' ')}
          >
            <div className="sm:hidden px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#10b981] flex items-center justify-center font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="block text-[0.9rem] font-bold text-gray-900 truncate">{officerName}</span>
                <span className="block text-[0.75rem] text-gray-500 font-medium truncate">ID: {officerRole}</span>
              </div>
            </div>

            <div className="sm:hidden px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              {/* <span className="text-[0.8rem] font-bold text-gray-700">Language</span> */}
              <div className="flex items-center gap-1 rounded-full w-full border border-gray-200 p-0.5 bg-gray-50">
                <button
                  onClick={() => setSelectedLanguage('EN')}
                  className={`px-2 py-1 text-[0.7rem] w-1/2 font-bold rounded-full transition-colors ${selectedLanguage === 'EN' ? 'bg-[#fbbf24] text-[#1e293b]' : 'text-gray-500'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setSelectedLanguage('AM')}
                  className={`px-2 py-1 text-[0.7rem] w-1/2 font-bold rounded-full transition-colors ${selectedLanguage === 'AM' ? 'bg-[#fbbf24] text-[#1e293b]' : 'text-[#14532d]'}`}
                >
                  አማ
                </button>
              </div>
            </div>
            <div className="flex flex-col py-1.5">
              <button
                onClick={closeProfileMenu}
                className="flex items-center gap-3.5 px-4 py-2.5 text-[0.85rem] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <UserRound size={16} className="text-gray-600" strokeWidth={2} />
                Profile
              </button>
              <button
                onClick={closeProfileMenu}
                className="flex items-center gap-3.5 px-4 py-2.5 text-[0.85rem] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <Settings size={16} className="text-gray-600" strokeWidth={2} />
                Settings
              </button>
            </div>

            <div className="h-[1px] bg-gray-100 w-full" />

            <div className="flex flex-col py-1.5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3.5 px-4 py-2.5 text-[0.85rem] font-medium text-[#ef4444] hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut size={16} className="text-[#ef4444]" strokeWidth={2} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
