'use client';

import { useEscapeToClose } from '@/hooks/useEscapeToClose';
import { Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// useLayoutEffect warns when a client component is server-rendered (Next.js
// renders these on the server too), and there is nothing to measure there
// anyway — fall back to useEffect outside the browser.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface DatePickerFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  usePortal?: boolean;
  align?: 'left' | 'right';
  openUpwards?: boolean;
  forcePosition?: 'bottom' | 'top' | undefined;
  onOpenChange?: (isOpen: boolean) => void;
}

export function DatePickerField({ id, label, value, onChange, required, error, disabled, placeholder = 'dd/mm/yyyy', minDate, maxDate, usePortal = true, align = 'left', openUpwards = false, forcePosition, onOpenChange }: DatePickerFieldProps) {
  const today = new Date();

  // Use today as fallback if value is empty, but don't set it to state
  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'day' | 'year'>('day');
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const ref = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dialogTitleId = useId();

  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEscapeToClose(isOpen, () => {
    setIsOpen(false);
    setMode('day');
    ref.current?.focus();
  }, [ref, dropdownRef]);

  // Not using the shared useClickOutside hook here: when usePortal is true the
  // dropdown renders outside this component's DOM subtree (into document.body),
  // so "outside" has to be checked against both the trigger AND the portaled
  // dropdown — useClickOutside only supports a single ref.
  useEffect(() => {
    function h(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
        setMode('day');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', h);
    }
    return () => {
      document.removeEventListener('mousedown', h);
    };
  }, [isOpen]);

  // Positioning runs in a layout effect, not a plain one. `dropdownPos` starts at
  // {0,0}, so the portal's first commit puts the calendar in the top-left corner
  // of the page; measuring in a passive effect happens after that frame is painted
  // and the calendar visibly jumps to the trigger. useLayoutEffect commits the
  // measured position before the browser paints, so the {0,0} frame is never shown.
  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    let left = rect.left + window.scrollX;
    if (left + 280 > window.innerWidth) {
      left = Math.max(0, rect.right + window.scrollX - 280);
    }

    let top = rect.bottom + window.scrollY;
    // Approximate calendar height is 340px
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // forcePosition pins the calendar; otherwise flip up only when it would not fit below.
    const openUp =
      forcePosition === 'top' ||
      (forcePosition !== 'bottom' && spaceBelow < 340 && spaceAbove > spaceBelow);
    if (openUp) {
      top = rect.top + window.scrollY - 350;
    }

    setDropdownPos({ top, left });
  }, [isOpen, forcePosition]);

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, '0')} / ${MONTH_SHORT[selectedDate.getMonth()]} / ${selectedDate.getFullYear()}`
    : '';

  function isDisabled(y: number, m: number, d: number) {
    const dt = new Date(y, m, d);
    if (minDate && dt < minDate) return true;
    if (maxDate && dt > maxDate) return true;
    return false;
  }

  function selectDay(d: number) {
    if (isDisabled(viewYear, viewMonth, d)) return;
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
    setMode('day');
  }

  function selectToday() {
    const t = new Date();
    if (isDisabled(t.getFullYear(), t.getMonth(), t.getDate())) return;
    const dateStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    onChange(dateStr);
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setIsOpen(false);
    setMode('day');
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build 6×7 grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, type: 'other' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'cur' });
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, type: 'other' });

  const yearRange = [];
  const startYear = today.getFullYear() - 100;
  const endYear = today.getFullYear() + 50;
  for (let y = endYear; y >= startYear; y--) yearRange.push(y);

  const calendarBody = (
    <>
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button type="button" onClick={() => setMode(m => m === 'year' ? 'day' : 'year')}
          aria-expanded={mode === 'year'} aria-haspopup="listbox"
          className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
          {MONTH_FULL[viewMonth]} {viewYear}
          <ChevronDown size={14} className={`transition-transform ${mode === 'year' ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth} aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          </button>
          <button type="button" onClick={nextMonth} aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {mode === 'year' ? (
        <div className="h-56 overflow-y-auto px-2 py-2" role="listbox" aria-label="Select year">
          <div className="grid grid-cols-3 gap-1">
            {yearRange.map(y => (
              <button key={y} type="button" onClick={() => { setViewYear(y); setMode('day'); }}
                role="option" aria-selected={y === viewYear}
                className={`rounded-lg py-2 text-sm font-medium transition-colors
                  ${y === viewYear ? 'bg-[#16A34A] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                {y}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 pb-3 pt-2">
          <div className="mb-2 grid grid-cols-7">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1 text-center text-[12px] font-medium text-gray-900" aria-hidden="true">{d[0]}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, idx) => {
              if (cell.type === 'other') {
                return <div key={idx} className="flex h-8 w-8 items-center justify-center mx-auto text-sm text-gray-400" aria-hidden="true">{cell.day}</div>;
              }
              const disabled = isDisabled(viewYear, viewMonth, cell.day);
              const selected = selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === cell.day;
              const isTodayCell = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === cell.day;
              return (
                <button key={idx} type="button" onClick={() => selectDay(cell.day)} disabled={disabled}
                  aria-pressed={!!selected} aria-current={isTodayCell ? 'date' : undefined}
                  aria-label={`${cell.day} ${MONTH_FULL[viewMonth]} ${viewYear}`}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-all
                    ${selected ? 'font-medium bg-[#16A34A] text-white'
                      : disabled ? 'cursor-not-allowed text-gray-300'
                        : isTodayCell ? 'font-bold text-[#16A34A] border border-[#16A34A] hover:bg-green-50'
                          : 'text-gray-900 hover:bg-gray-100'}`}>
                  {cell.day}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between pt-1">
            <button type="button" onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors">Clear</button>
            <button type="button" onClick={selectToday}
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors">Today</button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="relative flex flex-col gap-1.5 w-full">
      <input type="text" className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0" value={value} onChange={() => { }} required={required} tabIndex={-1} aria-hidden="true" />
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#374151]">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}
      <button ref={ref} id={id} type="button" onClick={() => { if (disabled) return; setIsOpen(o => !o); setMode('day'); }}
        aria-haspopup="dialog" aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 border-[#EDEFF1] bg-white hover:border-green-600/50
          ${disabled ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
            : error ? 'border-red-400 bg-red-50/40'
              : isOpen ? 'border-green-600 bg-white ring-0 ring-green-600'
                : 'border-[#16A34A] bg-white hover:border-green-600/50'}`}>
        <span className={`flex items-center gap-2 ${disabled ? 'text-gray-500' : displayValue ? 'text-[#111827]' : 'text-gray-400'}`}>
          <Calendar size={16} className="shrink-0 text-gray-400" />
          {displayValue || placeholder}
        </span>
      </button>

      {isOpen && typeof document !== 'undefined' && (usePortal ? createPortal(
        <div ref={dropdownRef} role="dialog" aria-modal="false" aria-labelledby={dialogTitleId} className="absolute z-[99999] mt-1.5 w-[280px] max-w-[100vw] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden origin-top"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            maxWidth: '100vw'
          }}>
          <span id={dialogTitleId} className="sr-only">Choose date</span>
          {calendarBody}
        </div>,
        document.body
      ) : (
        <div ref={dropdownRef} role="dialog" aria-modal="false" aria-labelledby={dialogTitleId} className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${(forcePosition ? forcePosition === 'top' : openUpwards) ? 'bottom-[calc(100%+4px)] origin-bottom animate-in fade-in slide-in-from-bottom-2' : 'top-[calc(100%+4px)] origin-top animate-in fade-in slide-in-from-top-2'} z-50 w-[280px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden duration-200`}>
          <span id={dialogTitleId} className="sr-only">Choose date</span>
          {calendarBody}
        </div>
      ))}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
