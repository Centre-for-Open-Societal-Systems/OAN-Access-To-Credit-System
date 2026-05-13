import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  UserRound,
  ShieldAlert,
  Sprout,
  Tractor,
  Users,
} from 'lucide-react';

const roles = [
  {
    id: 'farmer-applicant',
    title: 'Farmer Applicant',
    description: 'Credit assessment, underwriting, approval',
    icon: Tractor,
  },
  {
    id: 'development-agent',
    title: 'Development Agent',
    description: 'Field operations, KYC, and application entry',
    icon: Users,
  },
  {
    id: 'bank-admin',
    title: 'Bank Admin',
    description: 'Credit assessment, underwriting, approval',
    icon: Building2,
  },
];

const activeAgents = [
  { initials: 'AM', tone: 'linear-gradient(135deg, #8bd0f7 0%, #2d6ea8 100%)' },
  { initials: 'SN', tone: 'linear-gradient(135deg, #f4b27e 0%, #d96525 100%)' },
  { initials: 'TK', tone: 'linear-gradient(135deg, #9ed8a7 0%, #4c8c67 100%)' },
];

const languages = [
  { code: 'en', label: 'English', country: 'United States', flag: '🇺🇸' },
  { code: 'am', label: 'Amharic', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'ar', label: 'Arabic', country: 'Saudi Arabia', flag: '🇸🇦' },
];

function LoginPage({ onSignIn }) {
  const [selectedRole, setSelectedRole] = useState(roles[1]);
  const [activeHeaderAction, setActiveHeaderAction] = useState('login');
  const [activeLanguage, setActiveLanguage] = useState(languages[0]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [portalMode, setPortalMode] = useState('selection');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const languageMenuRef = useRef(null);

  const selectedRoleTitle = selectedRole.title;
  const portalSubtitle =
    portalMode === 'signin'
      ? `Access the ${selectedRoleTitle}`
      : 'Select your role to access the agricultural credit system network.';

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!languageMenuRef.current) {
        return;
      }

      if (!languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const handleContinueToSignIn = () => {
    setPortalMode('signin');
    setIsLanguageMenuOpen(false);
    setIsPasswordVisible(false);
  };

  const handleReturnToSelection = () => {
    setPortalMode('selection');
    setIsPasswordVisible(false);
    setIsLanguageMenuOpen(false);
  };

  const handleSignInSubmit = (event) => {
    event.preventDefault();
    onSignIn?.();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <style>{`
        @keyframes portal-scene-pop {
          0% { opacity: 0; transform: translateY(0.65rem) scale(0.99); }
          70% { opacity: 1; transform: translateY(-0.08rem) scale(1.005); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-portal-scene-pop {
          animation: portal-scene-pop 260ms ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-portal-scene-pop { animation: none !important; }
        }
      `}</style>
      <header className="w-full pt-0">
        <div className="flex items-center justify-between rounded-[0.5rem] border border-slate-200 bg-white px-4 py-2.5 shadow-[0_4px_12px_rgba(15,23,42,0.08)] sm:px-5 max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-[0.45rem] text-white shadow-[0_10px_22px_rgba(15,33,60,0.2)] bg-[linear-gradient(180deg,var(--panel-bg)_0%,var(--panel-bg-deep)_100%)]" aria-hidden="true">
              <Sprout size={22} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[0.9rem] font-semibold tracking-tight text-slate-900">Open Agri</span>
              <span className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-slate-500 leading-4">ACCESS CREDIT SYSTEM</span>
            </div>
          </div>

          <div className="inline-flex items-stretch gap-1 rounded-[0.65rem] border border-slate-200 bg-slate-50 p-1 max-sm:w-full" aria-label="Header actions">
            <button
              className={`inline-flex min-w-[5.1rem] items-center justify-center gap-2 rounded-[0.45rem] px-4 py-2 text-[0.78rem] font-semibold leading-none transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,185,129,0.22)] max-sm:min-w-0 max-sm:flex-1 max-sm:px-3 max-sm:py-2 max-sm:text-[0.75rem] ${activeHeaderAction === 'login' ? 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(16,185,129,0.24)] scale-100' : 'bg-white text-emerald-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:-translate-y-[1px] hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)] scale-[0.98] hover:scale-100'}`}
              type="button"
              aria-pressed={activeHeaderAction === 'login'}
              onClick={() => setActiveHeaderAction('login')}
            >
              Login
            </button>
            <button
              className={`inline-flex min-w-[5.1rem] items-center justify-center gap-2 rounded-[0.45rem] px-4 py-2 text-[0.78rem] font-semibold leading-none transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(16,185,129,0.22)] max-sm:min-w-0 max-sm:flex-1 max-sm:px-3 max-sm:py-2 max-sm:text-[0.75rem] ${activeHeaderAction === 'get-started' ? 'bg-emerald-600 text-white shadow-[0_8px_16px_rgba(16,185,129,0.24)] scale-100' : 'bg-white text-emerald-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:-translate-y-[1px] hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)] scale-[0.98] hover:scale-100'}`}
              type="button"
              aria-pressed={activeHeaderAction === 'get-started'}
              onClick={() => setActiveHeaderAction('get-started')}
            >
              <span>Get Started</span>
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center py-5 lg:py-6">
        <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="mx-auto grid w-full max-w-[980px] overflow-hidden rounded-[1.1rem] border border-white/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.14)] lg:h-[48rem] lg:grid-cols-2 max-lg:grid-cols-1">
            <div className="relative flex flex-col justify-between text-white overflow-hidden pt-[2.1rem] px-[2rem] pb-[2rem] bg-[linear-gradient(180deg,var(--panel-bg)_0%,var(--panel-bg-deep)_100%)] max-lg:min-h-auto max-sm:p-6 before:content-[''] before:absolute before:rounded-[999px] before:pointer-events-none before:-right-[4rem] before:-top-[4.5rem] before:w-[12rem] before:h-[12rem] before:bg-[radial-gradient(circle,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_72%)] after:content-[''] after:absolute after:rounded-[999px] after:pointer-events-none after:-left-[4.5rem] after:bottom-[4rem] after:w-[10rem] after:h-[10rem] after:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_72%)]">
              <div className="relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-10 w-10 place-items-center rounded-[0.5rem] bg-white text-[color:var(--panel-bg)] shadow-[0_8px_18px_rgba(0,0,0,0.12)]" aria-hidden="true">
                    <Sprout size={18} strokeWidth={2.4} />
                  </div>
                  <span className="text-[1.05rem] font-semibold tracking-tight">Open AgriNet</span>
                </div>

                <span className="mt-8 inline-flex w-fit rounded-full border border-white/10 px-3 py-[0.28rem] text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-emerald-200/75 bg-[rgba(112,183,116,0.09)]">Field Agent Portal</span>

                <h1 className="mt-5 max-w-[15rem] text-[clamp(2.35rem,3.25vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.07em] text-white font-display">
                  Empowering
                  <br />
                  Ethiopian
                  <br />
                  Agriculture
                </h1>

                <p className="mt-5 max-w-[18rem] text-[0.95rem] leading-[1.55] text-slate-200/90 sm:text-[0.98rem]">
                  Facilitating seamless credit access for millions of farmers through
                  data-driven financial infrastructure. Secure, transparent, and resilient.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-200/90 relative z-10 max-sm:flex-col max-sm:items-start">
                <div className="flex items-center" aria-hidden="true">
                  {activeAgents.map((agent, index) => (
                    <span
                      key={agent.initials}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/60 text-[0.62rem] font-semibold text-white shadow-[0_8px_16px_rgba(0,0,0,0.16)]"
                      style={{
                        background: agent.tone,
                        marginLeft: index === 0 ? 0 : '-0.55rem',
                        zIndex: activeAgents.length - index,
                      }}
                    >
                      {agent.initials}
                    </span>
                  ))}
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/60 text-[0.62rem] font-semibold text-white shadow-[0_8px_16px_rgba(0,0,0,0.16)] ml-[-0.55rem] bg-slate-950/70 text-[0.64rem] tracking-tight">+2k</span>
                </div>

                <p className="text-[0.8rem] text-slate-200/85">
                  <span>Active agents in the field today</span>
                </p>
              </div>
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between bg-white px-5 py-6 sm:px-7 sm:py-7 lg:px-8 max-sm:p-6">
              <div className="mx-auto flex w-full max-w-[28rem] flex-col items-center text-center">
                <div className="flex w-full items-center gap-3">
                  {portalMode === 'signin' ? (
                    <button
                      className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[0.8rem] font-semibold text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-emerald-600/30 hover:text-emerald-600 hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)] active:scale-95"
                      type="button"
                      onClick={handleReturnToSelection}
                    >
                      <ArrowLeft size={14} strokeWidth={2.2} />
                      <span>Back</span>
                    </button>
                  ) : null}

                  <div className="flex flex-1 justify-end">
                  <div className="relative" ref={languageMenuRef}>
                    <button
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[0.8rem] font-semibold text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-emerald-600/30 hover:text-emerald-600 hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)] active:scale-95"
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={isLanguageMenuOpen}
                      onClick={() => setIsLanguageMenuOpen((current) => !current)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="text-[0.95rem] leading-none" aria-hidden="true">
                          {activeLanguage.flag}
                        </span>
                        <span className="leading-none">{activeLanguage.label}</span>
                      </span>
                      <ChevronDown size={14} strokeWidth={2.2} />
                    </button>

                    <div className={`absolute right-0 top-[calc(100%+0.45rem)] z-10 w-[12rem] max-sm:w-[9rem] overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white p-1 shadow-[0_14px_32px_rgba(15,23,42,0.12)] origin-top-right transition-all duration-200 ease-out ${isLanguageMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0 scale-100' : 'opacity-0 pointer-events-none -translate-y-2 scale-95'}`} role="menu">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          className={`flex w-full items-center justify-between gap-3 rounded-[0.65rem] px-3 py-2 text-left text-[0.8rem] font-medium transition duration-150 ${activeLanguage.code === language.code ? 'text-emerald-600 bg-emerald-600/10' : 'text-slate-600 hover:bg-emerald-600/5 hover:text-emerald-600'}`}
                          type="button"
                          role="menuitemradio"
                          aria-checked={activeLanguage.code === language.code}
                          onClick={() => {
                            setActiveLanguage(language);
                            setIsLanguageMenuOpen(false);
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="text-[0.95rem] leading-none" aria-hidden="true">
                              {language.flag}
                            </span>

                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-[0.8rem] font-semibold text-slate-700">
                                {language.label}
                              </span>
                              <span className="truncate text-[0.62rem] text-slate-500">
                                {language.country}
                              </span>
                            </span>
                          </span>
                          {activeLanguage.code === language.code ? (
                            <Check size={12} strokeWidth={3} />
                          ) : null}
                        </button>
                      ))}
                    </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-[clamp(1.65rem,2.45vw,2.1rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-slate-900 font-display">Welcome to the Portal</h2>
                  <p className="mt-0 text-[0.88rem] leading-[1.45] text-slate-500 sm:text-[0.9rem]">{portalSubtitle}</p>
                </div>
              </div>

              <div className="flex w-full flex-1 mt-12 flex-col animate-portal-scene-pop" data-mode={portalMode} key={portalMode}>
                {portalMode === 'selection' ? (
                  <>
                    <div className="mx-auto mt-[0.2rem] flex w-full max-w-[28rem] gap-3 rounded-[0.85rem] border px-4 py-2.5 shadow-[0_8px_24px_rgba(18,31,54,0.05)] border-[rgba(238,123,53,0.35)] bg-[color:var(--accent-soft)]">
                      <div className="mt-[0.1rem] grid h-7 w-7 place-items-center rounded-full text-[color:var(--accent)] bg-[rgba(238,123,53,0.12)]" aria-hidden="true">
                        <ShieldAlert size={16} strokeWidth={2.25} />
                      </div>

                      <div>
                        <strong className="block text-[0.9rem] font-semibold text-[color:var(--accent)]">Low Connectivity Detected</strong>
                        <p className="mt-1 text-[0.76rem] leading-5 text-[#a65c28]">
                          The system is operating in offline-optimized mode. Some features may sync
                          later.
                        </p>
                      </div>
                    </div>

                    <div className="mx-auto mt-[2.5rem] flex w-full max-w-[28rem] flex-col gap-4">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isActive = selectedRole.id === role.id;

                        return (
                          <button
                            key={role.id}
                            className={`flex w-full min-h-[4.5rem] items-center gap-4 rounded-[0.95rem] border px-4 py-[0.95rem] text-left transition-all duration-200 ${isActive ? 'border-emerald-600 shadow-[0_18px_34px_rgba(16,185,129,0.12)] scale-[1.02]' : 'bg-white border-[color:var(--border-subtle)] shadow-[0_1px_3px_rgba(18,31,54,0.05)] hover:-translate-y-[2px] hover:shadow-[0_14px_28px_rgba(18,31,54,0.09)]'}`}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                          >
                            <span className="grid h-9 w-9 place-items-center rounded-full text-emerald-600 bg-[linear-gradient(180deg,rgba(16,185,129,0.08)_0%,rgba(16,185,129,0.04)_100%)]" aria-hidden="true">
                              <Icon size={18} strokeWidth={2.2} />
                            </span>

                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="text-[0.96rem] font-semibold text-slate-900">{role.title}</span>
                              <span className="mt-0.5 text-[0.68rem] leading-[1.35] text-slate-500">{role.description}</span>
                            </span>

                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border bg-white text-emerald-600 ${isActive ? 'border-emerald-600' : 'border-[color:var(--border-subtle)]'}`} aria-hidden="true">
                              {isActive ? <Check size={12} strokeWidth={3} /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button className="mx-auto mt-[2.4rem] inline-flex w-full max-w-[28rem] min-h-[3.25rem] items-center justify-center gap-2 rounded-[0.85rem] px-4 py-3 sm:px-6 sm:py-3.5 text-[0.8rem] font-semibold text-white transition-all duration-200 bg-emerald-600 shadow-[0_14px_26px_rgba(16,185,129,0.25)] hover:bg-emerald-700 hover:shadow-[0_18px_32px_rgba(16,185,129,0.35)] hover:-translate-y-1 active:translate-y-0 active:scale-95" type="button" onClick={handleContinueToSignIn}>
                      <span>Continue to Sign In</span>
                      <ArrowRight size={16} strokeWidth={2.25} />
                    </button>

                    <p className="mx-auto mt-3 w-full max-w-[28rem] text-center text-[0.85rem] text-slate-500">
                      Need a new account? <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700">Register here</a>
                    </p>
                  </>
                ) : (
                  <form className="mx-auto mt-10 flex h-full w-full max-w-[28rem] flex-1 flex-col" onSubmit={handleSignInSubmit}>
                    <label className="flex flex-col gap-2">
                      <span className="text-[0.86rem] font-semibold text-slate-700">Phone Number or Email</span>
                      <span className="flex items-center gap-2 rounded-[0.65rem] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 focus-within:border-emerald-600/40 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center text-slate-400" aria-hidden="true">
                          <UserRound size={16} strokeWidth={2.2} />
                        </span>
                        <input
                          className="min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-slate-700 placeholder:text-slate-300 focus:outline-none"
                          type="text"
                          placeholder="+251 911 234 567"
                          autoComplete="username"
                        />
                      </span>
                    </label>

                    <label className="flex flex-col gap-2 mt-6">
                      <span className="text-[0.86rem] font-semibold text-slate-700">Password</span>
                      <span className="flex items-center gap-2 rounded-[0.65rem] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 focus-within:border-emerald-600/40 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]">
                        <span className="grid h-5 w-5 shrink-0 place-items-center text-slate-400" aria-hidden="true">
                          <Lock size={16} strokeWidth={2.2} />
                        </span>
                        <input
                          className="min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-slate-700 placeholder:text-slate-300 focus:outline-none"
                          type={isPasswordVisible ? 'text' : 'password'}
                          placeholder="•••••••"
                          autoComplete="current-password"
                        />
                        <button
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-slate-400 transition duration-150 hover:bg-slate-100 hover:text-slate-600"
                          type="button"
                          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                          onClick={() => setIsPasswordVisible((current) => !current)}
                        >
                          {isPasswordVisible ? (
                            <EyeOff size={16} strokeWidth={2.2} />
                          ) : (
                            <Eye size={16} strokeWidth={2.2} />
                          )}
                        </button>
                      </span>
                    </label>

                    <div className="mt-6 flex items-center justify-between gap-4 text-[0.84rem] max-sm:flex-col max-sm:items-start max-sm:gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2.5 text-slate-700 select-none group">
                        <span className="relative flex h-[1.05rem] w-[1.05rem] shrink-0">
                          <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                          <span className="pointer-events-none flex h-full w-full items-center justify-center rounded-[0.28rem] border-2 border-slate-300 bg-white transition-all duration-150 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 group-hover:border-emerald-400 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                            <svg className="hidden peer-checked:block w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </span>
                        <span>Remember me</span>
                      </label>

                      <a className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors" href="#">
                        Forgot password?
                      </a>
                    </div>

                    <button className="mx-auto mt-auto inline-flex w-full max-w-[28rem] items-center justify-center gap-2 rounded-[0.85rem] px-4 py-3 sm:px-6 sm:py-3.5 text-[0.9rem] font-semibold text-white transition-all duration-200 bg-emerald-600 shadow-[0_14px_26px_rgba(16,185,129,0.25)] hover:bg-emerald-700 hover:shadow-[0_18px_32px_rgba(16,185,129,0.35)] hover:-translate-y-1 active:translate-y-0 active:scale-95" type="submit">
                      Sign In
                    </button>

                    <p className="mx-auto mt-5 w-full max-w-[28rem] text-center text-[0.85rem] text-slate-500">
                      Need a new account? <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700">Register here</a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

export default LoginPage;