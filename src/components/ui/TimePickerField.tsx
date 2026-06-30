'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import styles from './TimePickerField.module.css';

interface TimePickerFieldProps {
  id?: string;
  label?: string;
  value: string; // Format: "HH:mm A" e.g. "02:35 PM"
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

export function TimePickerField({ id, label, value, onChange, required, error, disabled, placeholder = '--:-- --' }: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse existing value or default
  const match = value?.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
  const [hour, setHour] = useState(match ? match[1] : '');
  const [minute, setMinute] = useState(match ? match[2] : '');
  const [period, setPeriod] = useState(match ? match[3] : '');

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  useEffect(() => {
    // When any part changes, emit if all parts are selected
    if (hour && minute && period) {
      onChange(`${hour}:${minute} ${period}`);
    }
  }, [hour, minute, period, onChange]);

  const displayValue = (hour && minute && period) ? `${hour}:${minute} ${period}` : '';

  return (
    <div className="relative flex flex-col gap-1.5 w-full" ref={ref}>
      <input type="text" className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0" value={value} onChange={() => { }} required={required} tabIndex={-1} aria-hidden="true" />
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#374151]">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <button id={id} type="button" onClick={() => { if (disabled) return; setIsOpen(o => !o); }}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-sm transition-all focus:outline-none
          ${disabled ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default'
            : error ? 'border-red-400 bg-red-50/40'
              : isOpen ? 'border-[#1677FF] bg-white ring-1 ring-[#1677FF]'
                : 'border-[#D1D5DC] bg-white hover:border-[#1677FF]/50'}`}>
        <span className={`flex items-center gap-2 ${disabled ? 'text-gray-500' : displayValue ? 'text-[#111827]' : 'text-gray-400'}`}>
          <Clock size={16} className="shrink-0 text-gray-400" />
          {displayValue || placeholder}
        </span>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 z-50 mt-1.5 w-[240px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden transform-origin-top transition-all duration-200 ${styles.dropdown}`}>
          <div className="flex flex-row h-64 p-2 gap-1 bg-white">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {HOURS.map(h => (
                <button
                  key={h}
                  onClick={() => setHour(h)}
                  className={`w-full py-2 mb-1 text-center text-sm font-medium transition-colors ${
                    hour === h 
                      ? 'bg-[#1677FF] text-white border-2 border-black focus:outline-none' 
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {MINUTES.map(m => (
                <button
                  key={m}
                  onClick={() => setMinute(m)}
                  className={`w-full py-2 mb-1 text-center text-sm font-medium transition-colors ${
                    minute === m 
                      ? 'bg-[#1677FF] text-white' 
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`w-full py-2 mb-1 text-center text-sm font-medium transition-colors ${
                    period === p 
                      ? 'bg-[#1677FF] text-white' 
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
