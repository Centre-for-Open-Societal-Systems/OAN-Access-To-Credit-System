import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

export interface NavItem {
  path: string;
  activePaths?: string[];
  label: string;
  icon: LucideIcon;
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
  const router = useRouter();
  const pathname = usePathname();

  // Find the single most-specifically matched nav item for the current path.
  // Longer prefix wins, so /leads/lead beats /leads when visiting /leads/lead.
  const activeItem = useMemo(() => {
    let best = null;
    let bestLen = -1;
    for (const section of sections) {
      for (const item of section.items) {
        const paths = item.activePaths ?? [item.path];
        for (const ap of paths) {
          if (
            pathname === ap ||
            pathname.startsWith(ap + '/')
          ) {
            if (ap.length > bestLen) {
              bestLen = ap.length;
              best = item;
            }
          }
        }
      }
    }
    return best;
  }, [sections, pathname]);

  return (
    <aside
      className={[
        // ── Layout & colour ──────────────────────────────────────────────
        'flex flex-col text-white h-auto',
        'bg-[linear-gradient(180deg,var(--panel-bg)_0%,var(--panel-bg-deep)_100%)]',

        // ── Mobile (<900px): fixed off-canvas drawer ─────────────────────
        // top-0 + bottom-0 stretches to the true full screen height without
        // any explicit height value (avoids 100vh/100dvh browser quirks).
        'fixed top-0 bottom-0 left-0 z-[200] w-[calc(100vw-1rem)] max-w-[20rem] overflow-y-auto',
        'transition-[transform,box-shadow] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
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
          ? 'min-[900px]:w-[var(--dashboard-sidebar-width-collapsed)] min-[900px]:px-[0.35rem]'
          : 'min-[900px]:w-[var(--dashboard-sidebar-width)] min-[900px]:px-[0.65rem]',
      ].join(' ')}
    >
      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div
        className={[
          'flex shrink-0 items-center gap-0 border-b border-white/[0.08]',
          'px-[0.45rem] pb-0 pt-[0.9rem]',
          isCollapsed ? 'min-[900px]:justify-center min-[900px]:gap-0 min-[900px]:px-0' : '',
        ].join(' ')}
      >
        {/* Left Side: Logo Graphic */}
        <div className={`flex shrink-0 items-center justify-center ${isCollapsed ? 'w-full py-2' : ''}`}>
          <Image
            src="/logo.png"
            alt="OARI Logo"
            width={220}
            height={80}
            className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-[80%] h-auto max-h-12' : 'h-20 w-auto max-w-[220px] -mt-1.5'}`}
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
            'flex min-w-0 flex-col justify-center gap-[0.15rem]',
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
        className="flex flex-1 flex-col gap-4 px-0 py-3"
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
                  <button
                    key={item.path}
                    type="button"
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => router.push(item.path)}
                    className={[
                      'flex w-full items-center gap-[0.65rem] rounded-[0.55rem] border-0',
                      'px-[0.68rem] py-[0.7rem] text-left text-[1rem] leading-[1.1]',
                      'transition-[background-color,color,transform] duration-150 ease-in-out',
                      'hover:translate-x-[1px] hover:bg-white/[0.06] hover:text-white',
                      isActive
                        ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] font-bold'
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
                  </button>
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

