'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginThunk, selectAuthError, selectAuthStatus, clearAuthError } from '@/features/auth/store/authSlice';
import { HavingTroubleModal } from '@/features/auth/components/HavingTroubleModal';

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

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isLoading = authStatus === 'loading';

  const [activeLanguage, setActiveLanguage] = useState(languages[0]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTroubleModalOpen, setIsTroubleModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const portalSubtitle = 'Access the Development Agent';

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
      router.push('/leads');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[linear-gradient(0deg,#F9FAFB,#F9FAFB),#FFFFFF] font-sans">
      <header className="sticky top-0 w-full z-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-4 sm:px-6 py-4 sm:py-0 h-auto sm:h-[80px] border-b border-[#D4D4D4] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] gap-4 sm:gap-0">
          <div className="flex items-center gap-1 sm:gap-1">
            <img
              src="/logo.png"
              alt="Ethiopia OpenAgriNet Logo"
              className="h-[40px] sm:h-[48px] w-auto shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-[#16335A] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px]">Ethiopia OpenAgriNet</span>
              <span className="font-normal mt-[2px] sm:mt-[4px] uppercase text-[#65768E] text-[10px] sm:text-[12px] leading-[12px] tracking-[1px]">Access to Credit</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start" aria-label="Header actions">
            <button
              className="inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 ease-out rounded-lg h-[44px] min-w-0 flex-1 sm:flex-none px-3 py-2 sm:px-5 sm:py-[10px] text-[14px] sm:text-[16px] sm:leading-[24px] bg-[#16A34A] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#10883c] focus-visible:outline-2 focus-visible:outline-[rgba(3,164,79,0.22)] focus-visible:outline-offset-2"
              type="button"
              aria-pressed={true}
            >
              Login
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 ease-out rounded-lg h-[44px] min-w-0 flex-1 sm:flex-none px-3 py-2 sm:px-5 sm:py-[10px] text-[14px] sm:text-[16px] sm:leading-[24px] bg-white border border-[#E9E9E9] text-[#16335A] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-[rgba(3,164,79,0.22)] focus-visible:outline-offset-2"
              type="button"
              aria-pressed={false}
            >
              <span>Get Started</span>
              <ArrowRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center w-full">
        <section className="mx-auto flex flex-1 items-center justify-center py-8 lg:py-12 w-full px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-hidden bg-white w-full max-w-2xl lg:max-w-[1152px] lg:w-full h-auto lg:h-[700px] lg:min-h-[700px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-[16px] flex-col lg:flex-row min-h-0 mx-auto">
            <div className="flex flex-col justify-between isolate relative w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 min-h-auto bg-[linear-gradient(180deg,var(--panel-bg)_0%,var(--panel-bg-deep)_100%)]">
              <div className="relative z-10">
                <div className="flex items-center gap-0 mb-8 sm:mb-10">
                  <img
                    src="/logo.png"
                    alt="Ethiopia OpenAgriNet Logo"
                    className="h-[54px] sm:h-[64px] w-auto object-left shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-[16px] sm:text-[16px] leading-tight tracking-wide">Ethiopia OpenAgriNet</span>
                    <span className="text-[#E5E7EB] text-[10px] sm:text-[14px] font-normal leading-tight mt-1 tracking-widest">Access to Credit</span>
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
              <div className="flex flex-col items-center text-center w-full max-w-[448px] relative z-10">
                <div className="w-full flex justify-end mb-14 relative z-20">
                  <div className="relative" ref={languageMenuRef}>
                    <button
                      className="flex items-center gap-2 font-medium transition-colors hover:text-gray-900 text-[#4B5563] text-[14px] border border-gray-200 p-2 rounded-lg"
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={isLanguageMenuOpen}
                      onClick={() => setIsLanguageMenuOpen((current) => !current)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[0.95rem] leading-none" aria-hidden="true">
                          {activeLanguage.flag}
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
                            <span
                              className="text-[0.95rem] leading-none"
                              aria-hidden="true"
                            >
                              {language.flag}
                            </span>

                            <span className="flex flex-col">
                              <span className="truncate">
                                {language.label}
                              </span>
                              <span className="truncate text-xs text-gray-500">
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

                <div className="flex flex-col items-center gap-2 w-full mt-2">
                  <h2 className="font-bold text-[#111827] text-[28px] sm:text-[36px] leading-tight sm:leading-[40px]">Welcome to the Portal</h2>
                  <p className="m-0 text-[#6B7280] text-[14px] sm:text-[16px] leading-normal sm:leading-[24px]">{portalSubtitle}</p>
                </div>
              </div>

              <div className="flex w-full max-w-[448px] flex-col mt-8">
                <form className="flex flex-col gap-6 w-full" onSubmit={handleSignInSubmit}>
                  <label className="flex flex-col gap-2">
                    <span className="font-medium text-[#374151] text-[14px] leading-[20px]">Phone Number or Email</span>
                    <span className="relative flex items-center bg-white border border-[#D4D4D4] rounded-lg transition-shadow duration-200 h-[46px] focus-within:border-[var(--button-bg)] focus-within:ring-2 focus-within:ring-[rgba(3,164,79,0.2)] focus-within:ring-offset-0">
                      <span className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]" aria-hidden="true">
                        <UserRound size={16} strokeWidth={2.2} />
                      </span>
                      <input
                        className="w-full h-full bg-transparent border-0 pl-10 pr-3 focus:outline-none text-gray-900 placeholder:text-[#9CA3AF] text-[14px]"
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
                        className="w-full h-full bg-transparent border-0 pl-10 pr-[40px] focus:outline-none text-gray-900 placeholder:text-[#9CA3AF] text-[14px]"
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

                  <div className="mt-6 flex items-center justify-between gap-2 font-semibold">
                    <label className="inline-flex cursor-pointer select-none items-center gap-3 text-slate-700">
                      <input type="checkbox" className="w-6 h-6 cursor-pointer rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A] accent-[#16A34A]" />
                      <span className="text-[14px]">Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="font-semibold text-[#16335A] text-[14px] hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                      onClick={() => setIsTroubleModalOpen(true)}
                    >
                      <span className='text-[14px]'>Having trouble?</span>
                    </button>
                  </div>

                  {authError && (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[0.85rem] font-medium text-red-600">
                      {authError}
                    </p>
                  )}

                  <button className="flex items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 mt-2 w-full h-[56px] bg-[#16A34A] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[14px] hover:bg-[#10883c] disabled:opacity-70 disabled:cursor-not-allowed font-semibold" type="submit" disabled={isLoading}>
                    <span className='font-semibold'>{isLoading ? 'Signing in…' : 'Sign In'}</span>
                  </button>

                  <p className="border-t border-[#D4D4D4] mt-2 pt-6 flex justify-center text-[14px]">
                    <span className="text-[#6B7280]">Need a new account?</span> <span className='text-[#16A34A] font-bold'><a href="#" className="font-bold text-[#16A34A] hover:text-[#10883c] hover:underline ml-1">Register here</a></span>
                  </p>
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
