'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Sprout,
  UserRound,
  Lock,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import { loginThunk, selectAuthError, selectAuthStatus, clearAuthError } from '@/features/auth/store/authSlice';
import type { AppDispatch } from '@/store';



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

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const isLoading = authStatus === 'loading';

  const [activeLanguage, setActiveLanguage] = useState(languages[0]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const portalSubtitle = 'Access the agricultural credit system network.';

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!languageMenuRef.current) {
        return;
      }
      if (!languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);



  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginThunk({ usr: username, pwd: password }));
    if (loginThunk.fulfilled.match(result)) {
      router.push('/leads-dashboard');
    }
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
              data-active={true}
              type="button"
              aria-pressed={true}
            >
              Login
            </button>
            <button
              className="header-tab"
              data-active={false}
              type="button"
              aria-pressed={false}
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

              <div className="portal-panel__body">
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
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
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

                    {authError && (
                      <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[0.85rem] font-medium text-red-600">
                        {authError}
                      </p>
                    )}

                    <button className="sign-in-submit" type="submit" disabled={isLoading}>
                      {isLoading ? 'Signing in…' : 'Sign In'}
                    </button>

                    <p className="signup-line">
                      Need a new account? <a href="#">Register here</a>
                    </p>
                  </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
