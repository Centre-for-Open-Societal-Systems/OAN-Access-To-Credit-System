'use client';

import { useClickOutside } from '@/hooks/useClickOutside';
import { Check } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

const languages = [
  { code: 'en', label: 'English', country: 'United States', flagUrl: '/images/flags/us.svg' },
  { code: 'am', label: 'Amharic', country: 'Ethiopia', flagUrl: '/images/flags/et.svg' },
  { code: 'om', label: 'Afaan Oromo', country: 'Ethiopia', flagUrl: '/images/flags/et.svg' },
  { code: 'ar', label: 'Arabic', country: 'Saudi Arabia', flagUrl: '/images/flags/sa.svg' },
];

export function LanguageSelector() {
  const [activeLanguage, setActiveLanguage] = useState(languages[0]!);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setIsLanguageMenuOpen(false), []);
  useClickOutside(languageMenuRef, closeMenu, isLanguageMenuOpen);

  return (
    <div
      className="relative"
      ref={languageMenuRef}
      // A hand-rolled dropdown has to say what a native <select> says for free:
      // that it is expanded, which option is current, and that Escape closes it.
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isLanguageMenuOpen) {
          event.stopPropagation();
          setIsLanguageMenuOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isLanguageMenuOpen}
        aria-label={`Language, ${activeLanguage.label}`}
        onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
        className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 group border rounded-full px-3.5 py-1.5 hover:shadow-sm cursor-pointer ${isLanguageMenuOpen ? 'border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A] shadow-sm' : 'border-gray-300 bg-white text-gray-700 hover:border-[#16A34A] hover:bg-gray-50'}`}
      >
        <span className={`flex items-center justify-center w-4 h-4 transition-transform duration-300 ${isLanguageMenuOpen ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-12'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeLanguage.flagUrl} alt="" width={20} height={20} className="w-full h-full rounded-sm object-cover" />
        </span>
        <span className={`transition-colors duration-300 ${isLanguageMenuOpen ? 'text-[#16A34A]' : 'group-hover:text-[#16A34A]'}`}>{activeLanguage.label}</span>
      </button>
      {isLanguageMenuOpen && (
        <div role="menu" aria-label="Language" className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              type="button"
              key={lang.code}
              role="menuitemradio"
              aria-checked={activeLanguage.code === lang.code}
              onClick={() => { setActiveLanguage(lang); setIsLanguageMenuOpen(false); triggerRef.current?.focus(); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2 group/item">
                <span className="flex items-center justify-center w-4 h-4 transition-transform duration-300 group-hover/item:scale-125 group-hover/item:rotate-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lang.flagUrl} alt="" width={20} height={20} className="w-full h-full rounded-sm object-cover" />
                </span>
                <span className={activeLanguage.code === lang.code ? 'font-bold' : ''}>{lang.label}</span>
              </span>
              {activeLanguage.code === lang.code && <Check className="w-4 h-4 text-[#16A34A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
