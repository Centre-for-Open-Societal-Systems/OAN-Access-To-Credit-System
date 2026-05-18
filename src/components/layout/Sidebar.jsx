import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

function Sidebar({ isCollapsed, isMobileOpen = false, sections = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

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
          'flex shrink-0 items-center gap-3 border-b border-white/[0.08]',
          'px-[0.45rem] pb-4 pt-[0.8rem]',
          isCollapsed ? 'min-[900px]:justify-center min-[900px]:gap-0 min-[900px]:px-0' : '',
        ].join(' ')}
      >
        <div className="grid h-[2.35rem] w-[2.35rem] shrink-0 place-items-center rounded-lg bg-white text-panel shadow-[0_10px_20px_rgba(0,0,0,0.12)]">
          <ShieldCheck size={18} strokeWidth={2.3} />
        </div>
        <div
          className={[
            'flex min-w-0 flex-col gap-[0.15rem]',
            isCollapsed ? 'min-[900px]:hidden' : '',
          ].join(' ')}
        >
          <span className="text-base font-bold tracking-[-0.03em]">Open AgriNet</span>
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/[0.68]">
            Access Credit System
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
                'px-[0.45rem] text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/[0.48]',
                isCollapsed ? 'min-[900px]:hidden' : '',
              ].join(' ')}
            >
              {section.title}
            </h2>

            {/* Nav items */}
            <div className="flex flex-col gap-[0.15rem]">
              {section.items.map((item) => {
                const Icon = item.icon;
                const activePaths = item.activePaths ?? [item.path];
                const isActive = activePaths.includes(location.pathname);

                return (
                  <button
                    key={item.path}
                    type="button"
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => navigate(item.path)}
                    className={[
                      'flex w-full items-center gap-[0.65rem] rounded-[0.55rem] border-0',
                      'px-[0.68rem] py-[0.62rem] text-left text-[0.9rem] font-medium leading-[1.1]',
                      'transition-[background-color,color,transform] duration-150 ease-in-out',
                      'hover:translate-x-[1px] hover:bg-white/[0.06] hover:text-white',
                      isActive
                        ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                        : 'bg-transparent text-white/[0.76]',
                      isCollapsed
                        ? 'min-[900px]:justify-center min-[900px]:gap-0 min-[900px]:px-[0.35rem]'
                        : '',
                    ].join(' ')}
                  >
                    <span
                      className="grid h-[0.9rem] w-[0.9rem] shrink-0 place-items-center"
                      aria-hidden="true"
                    >
                      <Icon size={14} strokeWidth={2.3} />
                    </span>
                    <span
                      className={[
                        'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
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

