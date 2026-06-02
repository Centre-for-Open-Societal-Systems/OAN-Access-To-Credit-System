import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface DatePickerFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function DatePickerField({ id, label, value, onChange, required, error, disabled }: DatePickerFieldProps) {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'day' | 'year'>('day');
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : maxDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : maxDate.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { 
      if (ref.current && !ref.current.contains(e.target as Node)) { 
        setIsOpen(false); 
        setMode('day'); 
      } 
    }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  const displayValue = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, '0')} / ${MONTH_SHORT[selectedDate.getMonth()]} / ${selectedDate.getFullYear()}`
    : '';

  function isDisabled(y: number, m: number, d: number) {
    const dt = new Date(y, m, d);
    return dt > maxDate || dt < minDate;
  }

  function selectDay(d: number) {
    if (isDisabled(viewYear, viewMonth, d)) return;
    onChange(new Date(viewYear, viewMonth, d).toISOString().split('T')[0]);
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
  for (let y = maxDate.getFullYear(); y >= minDate.getFullYear(); y--) yearRange.push(y);

  return (
    <div className="relative flex flex-col gap-1.5" ref={ref}>
      <input type="text" className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0" value={value} onChange={() => {}} required={required} tabIndex={-1} aria-hidden="true" />
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button id={id} type="button" onClick={() => { if (disabled) return; setIsOpen(o => !o); setMode('day'); }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-3 text-sm shadow-sm transition-all focus:outline-none
          ${disabled ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-default'
            : error ? 'border-red-400 bg-red-50/40'
              : isOpen ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15'
                : 'border-gray-300 bg-white hover:border-[#4a7c59]/50'}`}>
        <span className={`flex items-center gap-2 ${disabled ? 'text-gray-500' : displayValue ? 'text-gray-900' : 'text-gray-400'}`}>
          <Calendar size={14} className="shrink-0 text-gray-400" />
          {displayValue || 'DD / MM / YYYY'}
        </span>
        <Calendar size={15} className="shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#16A34A' }}>
            <button type="button" onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setMode(m => m === 'year' ? 'day' : 'year')}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-white/80 transition-colors">
              {MONTH_FULL[viewMonth]} {viewYear}
              <ChevronDown size={13} className={`transition-transform ${mode === 'year' ? 'rotate-180' : ''}`} />
            </button>
            <button type="button" onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {mode === 'year' ? (
            <div className="h-56 overflow-y-auto px-2 py-2">
              <div className="grid grid-cols-3 gap-1">
                {yearRange.map(y => (
                  <button key={y} type="button" onClick={() => { setViewYear(y); setMode('day'); }}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors
                      ${y === viewYear ? 'text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    style={y === viewYear ? { background: '#16A34A' } : {}}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-3 pb-3 pt-2">
              <div className="mb-1 grid grid-cols-7">
                {DAY_NAMES.map(d => (
                  <div key={d} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((cell, idx) => {
                  if (cell.type === 'other') {
                    return <div key={idx} className="flex h-8 w-8 items-center justify-center mx-auto text-xs text-gray-300">{cell.day}</div>;
                  }
                  const disabled = isDisabled(viewYear, viewMonth, cell.day);
                  const selected = selectedDate &&
                    selectedDate.getFullYear() === viewYear &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getDate() === cell.day;
                  const isTodayCell = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === cell.day;
                  return (
                    <button key={idx} type="button" onClick={() => selectDay(cell.day)} disabled={disabled}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all
                        ${selected ? 'font-semibold text-white shadow'
                          : disabled ? 'cursor-not-allowed text-gray-300'
                            : isTodayCell ? 'font-semibold border-2 hover:bg-opacity-10'
                              : 'text-gray-700 hover:bg-gray-100'}`}
                      style={
                        selected ? { background: '#4a7c59' }
                          : isTodayCell ? { borderColor: '#4a7c59', color: '#4a7c59' }
                            : {}
                      }>
                      {cell.day}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                <button type="button" onClick={() => { onChange(''); setIsOpen(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear</button>
                <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  <AlertTriangle size={9} /> Must be 18+
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
