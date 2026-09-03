'use client';

import { useClickOutside } from '@/hooks/useClickOutside';
import { ChevronDown } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface CountryCodeOption {
  code: string;
  country: string;
  /** Omitted when no flag asset exists for this country yet. */
  flagUrl?: string;
}

interface CountryCodeSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: CountryCodeOption[];
  /** The trigger button's classes, so each form can match its own input
   *  styling (joined-pill vs. standalone box, border radius, colors). */
  triggerClassName: string;
  /** Shows a chevron indicator on the trigger. Off by default. */
  showChevron?: boolean;
}

/**
 * Dialling-code picker for phone fields, shared across every form that
 * collects a phone number with a country code.
 *
 * This is a hand-rolled dropdown standing in for a native <select>, which is
 * where the ARIA below comes from: a <select> announces itself as a collapsed
 * list, says which option is current, and closes on Escape without anyone
 * writing that. None of it is free once the control is a button and a div, so
 * it is spelled out — expanded state on the trigger, a menu role with a checked
 * item, and Escape returning focus to the trigger it came from.
 */
export function CountryCodeSelect({ value, onChange, options, triggerClassName, showChevron = false }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const active = options.find((c) => c.code === value) || options[0];

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close, isOpen);

  if (!active) return null;

  return (
    <div
      className="relative flex shrink-0"
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Country code, ${active.country} ${active.code}`}
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
      >
        {active.flagUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.flagUrl} alt="" width={20} height={16} className="w-5 h-4 rounded-sm object-cover" />
        )}
        <span>{active.code}</span>
        {showChevron && (
          <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      {isOpen && (
        <div role="menu" aria-label="Country code" className="absolute top-full left-0 mt-1 w-full min-w-[140px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
          {options.map((c) => (
            <button
              key={c.code}
              type="button"
              role="menuitemradio"
              aria-checked={value === c.code}
              onClick={() => {
                onChange(c.code);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-gray-50 ${value === c.code ? 'bg-gray-50 font-bold' : 'font-medium text-gray-700'}`}
            >
              {c.flagUrl && (
                // The flag repeats the country the label already names, so it is
                // decorative — an alt here reads the country out twice.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.flagUrl} alt="" width={20} height={16} className="w-5 h-4 rounded-sm object-cover shrink-0" />
              )}
              <span>{c.country} {c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
