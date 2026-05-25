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
import { useNavigate } from 'react-router-dom';

import './Login.module.scss';

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

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(roles[1]);
  const [activeHeaderAction, setActiveHeaderAction] = useState('login');
  const [activeLanguage, setActiveLanguage] = useState(languages[0]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [portalMode, setPortalMode] = useState('signin');
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
    navigate('/leads-dashboard');
  };

  return (
    <div className="app-shell">
      <header className="header-shell">
        <div className="header-bar">
          <div className="brand-mark">
            <div className="brand-icon" aria-hidden="true">
              <Sprout size={26} strokeWidth={2.2} />
            </div>
            <div className="brand-copy">
              <span className="brand-title">Open Agri</span>
              <span className="brand-subtitle">ACCESS CREDIT SYSTEM</span>
            </div>
          </div>

          <div className="header-actions" aria-label="Header actions">
            <button
              className="header-tab"
              data-active={activeHeaderAction === 'login'}
              type="button"
              aria-pressed={activeHeaderAction === 'login'}
              onClick={() => setActiveHeaderAction('login')}
            >
              Login
            </button>
            <button
              className="header-tab"
              data-active={activeHeaderAction === 'get-started'}
              type="button"
              aria-pressed={activeHeaderAction === 'get-started'}
              onClick={() => setActiveHeaderAction('get-started')}
            >
              <span>Get Started</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      <main className="content-wrap">
        <section className="page-frame w-full">
          <div className="card-shell">
            <div className="hero-panel">
              <div className="hero-panel__top">
                <div className="hero-brand">
                  <div className="hero-brand__icon" aria-hidden="true">
                    <Sprout size={22} strokeWidth={2.4} />
                  </div>
                  <span className="hero-brand__name">Open AgriNet</span>
                </div>

                <span className="hero-pill">Field Agent Portal</span>

                <h1 className="hero-title font-display">
                  Empowering
                  <br />
                  Ethiopian
                  <br />
                  Agriculture
                </h1>

                <p className="hero-copy">
                  Facilitating seamless credit access for millions of farmers through
                  data-driven financial infrastructure. Secure, transparent, and resilient.
                </p>
              </div>

              <div className="hero-panel__bottom">
                <div className="avatar-stack" aria-hidden="true">
                  {activeAgents.map((agent, index) => (
                    <span
                      key={agent.initials}
                      className="avatar-stack__item"
                      style={{
                        background: agent.tone,
                        marginLeft: index === 0 ? 0 : '-0.55rem',
                        zIndex: activeAgents.length - index,
                      }}
                    >
                      {agent.initials}
                    </span>
                  ))}
                  <span className="avatar-stack__item avatar-stack__item--count">+2k</span>
                </div>

                <p className="hero-footnote">
                  <span>Active agents in the field today</span>
                </p>
              </div>
            </div>

            <div className="portal-panel">
              <div className="portal-panel__top">
                <div className="portal-panel__topbar">


                  <div className="portal-panel__locale-row">
                    <div className="portal-panel__locale" ref={languageMenuRef}>
                      <button
                        className="portal-panel__locale-button"
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={isLanguageMenuOpen}
                        onClick={() => setIsLanguageMenuOpen((current) => !current)}
                      >
                        <span className="portal-panel__locale-button-content">
                          <span className="portal-panel__locale-flag" aria-hidden="true">
                            {activeLanguage.flag}
                          </span>
                          <span className="portal-panel__locale-text">{activeLanguage.label}</span>
                        </span>
                        <ChevronDown size={14} strokeWidth={2.2} />
                      </button>

                      <div
                        className="portal-panel__locale-menu"
                        data-open={isLanguageMenuOpen}
                        role="menu"
                      >
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            className="portal-panel__locale-option"
                            data-active={activeLanguage.code === language.code}
                            type="button"
                            role="menuitemradio"
                            aria-checked={activeLanguage.code === language.code}
                            onClick={() => {
                              setActiveLanguage(language);
                              setIsLanguageMenuOpen(false);
                            }}
                          >
                            <span className="portal-panel__locale-option-main">
                              <span
                                className="portal-panel__locale-option-flag"
                                aria-hidden="true"
                              >
                                {language.flag}
                              </span>

                              <span className="portal-panel__locale-option-copy">
                                <span className="portal-panel__locale-option-label">
                                  {language.label}
                                </span>
                                <span className="portal-panel__locale-option-country">
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

                <div className="portal-panel__heading">
                  <h2 className="font-display">Welcome to the Portal</h2>
                  <p>{portalSubtitle}</p>
                </div>
              </div>

              <div className="portal-panel__body" data-mode={portalMode} key={portalMode}>
                {portalMode === 'selection' ? (
                  <>
                    <div className="connect-banner">
                      <div className="connect-banner__icon" aria-hidden="true">
                        <ShieldAlert size={16} strokeWidth={2.25} />
                      </div>

                      <div className="connect-banner__copy">
                        <strong>Low Connectivity Detected</strong>
                        <p>
                          The system is operating in offline-optimized mode. Some features may sync
                          later.
                        </p>
                      </div>
                    </div>

                    <div className="role-list">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isActive = selectedRole.id === role.id;

                        return (
                          <button
                            key={role.id}
                            className="role-card"
                            data-active={isActive}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                          >
                            <span className="role-card__icon" aria-hidden="true">
                              <Icon size={18} strokeWidth={2.2} />
                            </span>

                            <span className="role-card__copy">
                              <span className="role-card__title">{role.title}</span>
                              <span className="role-card__description">{role.description}</span>
                            </span>

                            <span className="role-card__radio" aria-hidden="true">
                              {isActive ? <Check size={12} strokeWidth={3} /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button className="primary-cta" type="button" onClick={handleContinueToSignIn}>
                      <span>Continue to Sign In</span>
                      <ArrowRight size={16} strokeWidth={2.25} />
                    </button>

                    <p className="signup-line">
                      Need a new account? <a href="#">Register here</a>
                    </p>
                  </>
                ) : (
                  <form className="sign-in-form" onSubmit={handleSignInSubmit}>
                    <label className="sign-in-field">
                      <span className="sign-in-field__label">Phone Number or Email</span>
                      <span className="sign-in-field__control">
                        <span className="sign-in-field__icon" aria-hidden="true">
                          <UserRound size={16} strokeWidth={2.2} />
                        </span>
                        <input
                          className="sign-in-field__input"
                          type="text"
                          placeholder="+251 911 234 567"
                          autoComplete="username"
                        />
                      </span>
                    </label>

                    <label className="sign-in-field">
                      <span className="sign-in-field__label">Password</span>
                      <span className="sign-in-field__control">
                        <span className="sign-in-field__icon" aria-hidden="true">
                          <Lock size={16} strokeWidth={2.2} />
                        </span>
                        <input
                          className="sign-in-field__input"
                          type={isPasswordVisible ? 'text' : 'password'}
                          placeholder="•••••••"
                          autoComplete="current-password"
                        />
                        <button
                          className="sign-in-field__toggle"
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

                    <div className="mt-6 flex items-center justify-between gap-2 text-[0.84rem]">
                      <label className="inline-flex cursor-pointer select-none items-center gap-2 text-slate-700">
                        <input type="checkbox" />
                        <span>Remember me</span>
                      </label>

                      <a className="font-semibold text-[color:var(--button-bg)] hover:underline" href="#">
                        Forgot password?
                      </a>
                    </div>

                    <button className="sign-in-submit" type="submit">
                      Sign In
                    </button>

                    <p className="signup-line">
                      Need a new account? <a href="#">Register here</a>
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

export default Login;
