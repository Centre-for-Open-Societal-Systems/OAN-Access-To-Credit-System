import { LucideIcon } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { resolveActiveNavItem } from '@/lib/navUtils';

export interface NavItem {
  path: string;
  activePaths?: string[];
  label: string;
  icon: LucideIcon;
  /**
   * Count pill on the right of the item (e.g. products awaiting approval).
   * Hidden while the rail is collapsed, since there is no room for it there.
   * Omit — or pass 0 — for no pill.
   */
  badge?: number | undefined;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  sections?: NavSection[];
}

function Sidebar({ isCollapsed, isMobileOpen = false, sections = [] }: SidebarProps) {
  const pathname = usePathname();

  // Find the single most-specifically matched nav item for the current path.
  // Longer prefix wins, so /leads/lead beats /leads when visiting /leads/lead.
  const activeItem = useMemo(() => {
    return resolveActiveNavItem(sections, pathname);
  }, [sections, pathname]);

  return (
    <aside
      className={[
        // ── Layout & colour ──────────────────────────────────────────────
        // Through the theme tokens, not the literal hexes they hold. This is the
        // shell every role's portal renders — bank agent, dev agent and farmer —
        // so a colour pasted in here is a colour that can no longer be changed in
        // one place, and it was pasted in as part of a farmer-only redesign.
        'flex flex-col text-white h-auto',
        'bg-[var(--color-green-deep)]',

        // ── Mobile (<900px): fixed off-canvas drawer ─────────────────────
        // top-0 + bottom-0 stretches to the true full screen height without
        // any explicit height value (avoids 100vh/100dvh browser quirks).
        'fixed top-0 bottom-0 left-0 z-sticky w-[calc(100vw-1rem)] max-w-[20rem] overflow-x-hidden overflow-y-auto',
        'transition-all duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        isMobileOpen
          ? 'translate-x-0 shadow-[8px_0_40px_rgba(0,0,0,0.3)]'
          : '-translate-x-full shadow-none',

        // ── Desktop (≥900px): sticky sidebar, always full viewport height ─
        // sticky top-0 + h-screen: sidebar sticks to the top and fills the
        // full viewport height even when the main content is very long.
        'min-[900px]:sticky min-[900px]:top-0 min-[900px]:bottom-auto',
        'min-[900px]:h-screen min-[900px]:translate-x-0 min-[900px]:overflow-y-auto',
        'min-[900px]:shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]',
        isCollapsed
          ? 'min-[900px]:w-[var(--dashboard-sidebar-width-collapsed)]'
          : 'min-[900px]:w-[var(--dashboard-sidebar-width)]',
      ].join(' ')}
    >
      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div
        className={[
          'flex shrink-0 items-center h-20 gap-3 border-b border-white/[0.08]',
          'px-4',
          isCollapsed ? 'min-[900px]:justify-center min-[900px]:gap-0 min-[900px]:px-0' : '',
        ].join(' ')}
      >
        {/* Left Side: Logo Graphic */}
        <div className={`flex shrink-0 items-center justify-center ${isCollapsed ? 'w-full py-2' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="OARI Logo"
            width={1277}
            height={851}
            className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-[80%] h-auto max-h-12' : 'h-[34px] w-auto'}`}
            id="primary-logo-img"
            onError={(e) => {
              e.currentTarget.classList.add('hidden');
              const fallback = document.getElementById('fallback-logo-graphic');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          {/* Fallback graphic hidden by default (shows if image fails to load) */}
          <div id="fallback-logo-graphic" className="hidden items-center justify-center">
            <span className={`font-extrabold text-[#c4ea48] leading-none ${isCollapsed ? 'text-xl' : 'text-[2.2rem]'}`} style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.08em' }}>
              oari
            </span>
          </div>
        </div>

        {/* Right Side: Text */}
        <div
          className={[
            'flex min-w-0 flex-col justify-center gap-[.15rem]',
            isCollapsed ? 'min-[900px]:hidden' : 'flex',
          ].join(' ')}
        >
          <span className="text-[1.05rem] font-bold text-white leading-tight tracking-tight whitespace-nowrap">
            Ethiopia OpenAgriNet
          </span>
          <span className="text-[0.85rem] text-[#e2e8f0] tracking-wide leading-tight font-medium whitespace-nowrap">
            Access to Credit
          </span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav
        className={[
          'flex flex-1 flex-col gap-4 py-3',
          isCollapsed ? 'px-[0.35rem]' : 'px-[0.65rem]'
        ].join(' ')}
        aria-label="Dashboard navigation"
      >
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-[0.45rem]">

            {/* Section heading */}
            <h2
              className={[
                'px-[0.45rem] text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/[0.48]',
                isCollapsed ? 'min-[900px]:hidden' : '',
              ].join(' ')}
            >
              {section.title}
            </h2>

            {/* Nav items */}
            <div className="flex flex-col gap-[0.15rem]">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={[
                      'flex w-full items-center gap-[0.65rem] rounded-[0.55rem] border-0',
                      'px-[0.68rem] py-[0.7rem] text-left text-[1rem] leading-[1.1]',
                      'transition-all duration-150 ease-in-out',
                      'hover:translate-x-[1px] hover:bg-white/[0.06] hover:text-white',
                      isActive
                        ? 'bg-[var(--color-green-dark)] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] font-bold'
                        : 'bg-transparent text-white/[0.76] font-normal',
                      isCollapsed
                        ? 'min-[900px]:justify-center min-[900px]:gap-0 min-[900px]:px-[0.35rem]'
                        : '',
                    ].join(' ')}
                  >
                    <span
                      className="grid h-[1.1rem] w-[1.1rem] shrink-0 place-items-center"
                      aria-hidden="true"
                    >
                      <Icon size={17} strokeWidth={2.3} />
                    </span>
                    <span
                      className={[
                        'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
                        isActive ? 'font-bold' : 'font-normal',
                        isCollapsed ? 'min-[900px]:hidden' : '',
                      ].join(' ')}
                    >
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge !== null ? (
                      <span
                        className={[
                          'flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1',
                          'bg-[#EA580C] text-[11px] font-bold text-white shadow-sm',
                          isCollapsed ? 'min-[900px]:hidden' : '',
                        ].join(' ')}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

