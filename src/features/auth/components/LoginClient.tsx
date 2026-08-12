'use client';

import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    Eye,
    EyeOff, Globe, Lock, UserRound
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { logoutUser } from '@/features/auth/api/authApi';
import { HavingTroubleModal } from '@/features/auth/components/HavingTroubleModal';
import { clearAuthError, loginThunk, logout, selectAuthError, selectAuthStatus } from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const activeAgents = [
  { src: '/bb4a5b79fae40c0a468fa967443678ee9eb31bee.jpg', alt: 'Red-haired agent' },
  { src: '/15546d74033e37b4f05979285cbde9b0d8a08256.jpg', alt: 'Black male agent' },
  { src: '/c08326dd4541f98026723b0901e8ecaa33f73c17.jpg', alt: 'White male agent' },
];

const languages = [
  { code: 'en', label: 'English', country: 'United States', flag: '🇺🇸' },
  { code: 'am', label: 'Amharic', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'ar', label: 'Arabic', country: 'Saudi Arabia', flag: '🇸🇦' },
];

export function LoginClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isLoading = authStatus === 'loading';

  const [activeLanguage, setActiveLanguage] = useState(languages[0]!);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTroubleModalOpen, setIsTroubleModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const portalSubtitle = 'Coordinate field-level agricultural credit access across regions';

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

  const [deniedError, setDeniedError] = useState<string | null>(null);

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeniedError(null);
    dispatch(clearAuthError());
    const result = await dispatch(loginThunk({ usr: username, pwd: password, rememberMe }));
    if (loginThunk.fulfilled.match(result)) {
      const user = result.payload;
      if (user.kind === 'dev_agent') {
        router.push('/leads');
      } else {
        // Valid credentials, wrong portal: clear the session so the user
        // isn't left silently authenticated, then show a generic message.
        await logoutUser();
        dispatch(logout());
        setDeniedError(
          'These credentials are not valid for this portal. Please use your designated login page.'
        );
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[linear-gradient(0deg,#F9FAFB,#F9FAFB),#FFFFFF] font-sans">
      <main className="flex flex-1 items-center justify-center w-full py-8 lg:py-12">
        <section className="mx-auto flex flex-col flex-1 items-center justify-center w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl lg:max-w-[1152px] mx-auto mb-4 flex justify-start">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] font-semibold transition-colors">
              <ArrowLeft size={20} strokeWidth={2.5} />
              Back
            </button>
          </div>
          <div className="flex overflow-hidden bg-white w-full max-w-2xl lg:max-w-[1152px] lg:w-full h-auto lg:min-h-[800px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-[16px] flex-col lg:flex-row min-h-0 mx-auto">
            <div className="flex flex-col justify-between isolate relative w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 min-h-auto bg-[linear-gradient(180deg,var(--panel-bg)_0%,var(--panel-bg-deep)_100%)]">
              <div className="relative z-10">
                <div className="flex items-center gap-0 mb-8 sm:mb-10">
                  <Image
                    src="/logo.png"
                    alt="Ethiopia OpenAgriNet Logo"
                    width={220}
                    height={72}
                    className="h-[56px] sm:h-[72px] object-left shrink-0"
                    style={{ width: 'auto' }}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-[16px] sm:text-[20px] leading-tight tracking-wide">Ethiopia OpenAgriNet</span>
                    <span className="text-[#E5E7EB] text-[12px] sm:text-[14px] font-normal leading-tight mt-0 tracking-widest">Access to Credit</span>
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full border px-3 py-1 font-semibold uppercase bg-[#6d9f6c]/20 border-[#6d9f6c]/30 text-[#6D9F6C] text-[12px] tracking-[0.6px] w-fit">Field Agent Portal</span>

                <h1 className="mt-6 font-bold text-white text-[32px] sm:text-[40px] lg:text-[48px] leading-tight lg:leading-[60px]">
                  Empowering
                  <br />
                  Ethiopian
                  <br />
                  Agriculture
                </h1>

                <p className="mt-6 max-w-[448px] text-[#D1D5DB] text-[16px] sm:text-[18px] leading-relaxed sm:leading-[29px]">
                  Facilitating seamless credit access for millions of farmers through
                  data-driven financial infrastructure. Secure, transparent, and resilient.
                </p>
              </div>

              <div className="mt-8 sm:mt-auto pt-20 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                <div className="flex items-center" aria-hidden="true">
                  {activeAgents.map((agent, index) => (
                    <div
                      key={agent.src}
                      className="flex items-center justify-center rounded-full border-2 border-[#16335A] font-bold text-white w-[40px] h-[40px] text-[12px] relative overflow-hidden"
                      style={{
                        marginLeft: index === 0 ? 0 : '-12px',
                        zIndex: index + 1,
                      }}
                    >
                      <Image
                        src={agent.src}
                        alt={agent.alt}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <span
                    className="flex items-center justify-center rounded-full border-2 border-[#16335A] font-bold text-white w-[40px] h-[40px] text-[12px] -ml-[12px] bg-[#1F2937] z-0"
                    style={{ zIndex: activeAgents.length + 1 }}
                  >
                    +2k
                  </span>
                </div>

                <p className="text-[#D1D5DB] text-[14px]">
                  <span>Active agents in the field today</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16 relative bg-white w-full lg:w-1/2 z-10">
              <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-50" ref={languageMenuRef}>
                <button
                  className="flex items-center gap-2 font-medium transition-colors hover:text-gray-900 text-[#4B5563] text-[14px]"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isLanguageMenuOpen}
                  onClick={() => setIsLanguageMenuOpen((current) => !current)}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="flex items-center" aria-hidden="true">
                      <Globe size={16} className="text-[#6B7280]" />
                    </span>
                    <span className="leading-none">{activeLanguage.label}</span>
                  </span>
                  <ChevronDown size={14} strokeWidth={2.2} />
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+0.45rem)] z-50 w-[9rem] sm:w-[12rem] overflow-hidden rounded-[0.5rem] border border-slate-200 bg-white py-1 shadow-lg origin-top-right transition-all duration-180 ease-in-out ${isLanguageMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0 scale-100' : 'opacity-0 pointer-events-none -translate-y-[0.45rem] scale-96'}`}
                  role="menu"
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition duration-150 ${activeLanguage.code === language.code ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
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
                        <span className="flex flex-col">
                          <span className="truncate">{language.label}</span>
                          <span className="truncate text-xs text-gray-500">{language.country}</span>
                        </span>
                      </span>
                      {activeLanguage.code === language.code ? (
                        <Check size={12} strokeWidth={3} />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-center w-full max-w-[448px] relative z-10 mt-6 sm:mt-0">
                <div className="flex flex-col items-center gap-2 w-full mt-2">
                  <h2 className="font-bold text-[#111827] text-[28px] sm:text-[36px] leading-tight sm:leading-[40px]">Welcome to the Portal</h2>
                  <p className="m-0 text-[#6B7280] text-[14px] sm:text-[16px] leading-normal sm:leading-[24px]">{portalSubtitle}</p>
                </div>
              </div>

              <div className="flex w-full max-w-[448px] flex-col mt-8">
                {(deniedError || authError) && (
                  <div className="w-full mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    {deniedError || authError}
                  </div>
                )}
                <form className="flex flex-col gap-6 w-full font-bold" onSubmit={handleSignInSubmit}>
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-[#374151] text-[14px] leading-[20px]">Phone Number or Email</span>
                    <span className="relative flex items-center bg-white border border-[#D4D4D4] rounded-lg transition-shadow duration-200 h-[46px] focus-within:border-[var(--button-bg)] focus-within:ring-2 focus-within:ring-[rgba(3,164,79,0.2)] focus-within:ring-offset-0">
                      <span className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]" aria-hidden="true">
                        <UserRound size={16} strokeWidth={2.2} />
                      </span>
                      <input
                        className="w-full h-full bg-transparent border-0 pl-10 pr-3 focus:outline-none text-gray-900 placeholder:text-[#9CA3AF] text-[14px] font-normal"
                        type="text"
                        placeholder="+251 911 234 567"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </span>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-[#374151] text-[14px] leading-[20px]">Password</span>
                    <span className="relative flex items-center bg-white border border-[#D4D4D4] rounded-lg transition-shadow duration-200 h-[46px] focus-within:border-[var(--button-bg)] focus-within:ring-2 focus-within:ring-[rgba(3,164,79,0.2)] focus-within:ring-offset-0">
                      <span className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]" aria-hidden="true">
                        <Lock size={16} strokeWidth={2.2} />
                      </span>
                      <input
                        className="w-full h-full bg-transparent border-0 pl-10 pr-[40px] focus:outline-none text-gray-900 placeholder:text-[#9CA3AF] text-[14px] font-normal"
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="•••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-[#9CA3AF] hover:text-gray-600 transition-colors"
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
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="font-semibold text-[#16335A] hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                      onClick={() => setIsTroubleModalOpen(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {authError && (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[0.85rem] font-medium text-red-600">
                      {authError}
                    </p>
                  )}

                  <button suppressHydrationWarning className="flex items-center justify-center gap-2 rounded-lg font-bold text-white transition-colors duration-200 mt-2 w-full h-[56px] bg-[#16A34A] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] hover:bg-[#10883c] disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing in…' : (
                      <>
                        Continue to Sign In
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex flex-col items-center">
                    <div className="w-full flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                      <div className="mt-0.5 text-[#16A34A]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-[13px] text-[#166534] leading-relaxed">
                        <span className="font-bold">Secured by FaydaPass</span> — All sessions authenticated via Ethiopia National ID (Fayda Auth API)
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col items-center w-full">
                      <span className="text-[#6B7280] text-[12px] mb-3">Partner Banks</span>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['CBE', 'Dashen', 'Awash', 'CBO', 'Abyssinia', 'OIB'].map(bank => (
                          <span key={bank} className="px-4 py-1.5 rounded-full border border-[#bbf7d0] text-[#16A34A] text-[11px] font-bold tracking-wide">
                            {bank}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HavingTroubleModal
        isOpen={isTroubleModalOpen}
        onClose={() => setIsTroubleModalOpen(false)}
      />
    </div >
  );
}
