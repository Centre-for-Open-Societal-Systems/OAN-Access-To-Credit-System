import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { COL_FILTER_OPTS } from '../constants/leads.constants';

/* ─── DateSelect ────────────────────────────────────────────────────── */
interface DateSelectProps {
  value: string;
  options: readonly string[];
  onChange: (val: string) => void;
}

export function DateSelect({ value, options, onChange }: DateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative w-44">
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-all focus:outline-none ${isOpen ? 'border-[#4a7c59] bg-white ring-2 ring-[#4a7c59]/15' : 'border-gray-300 bg-white hover:border-[#4a7c59]/50'}`}
      >
        <span className="text-gray-900">{value}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#4a7c59]' : 'text-gray-400'}`} />
      </button>
      <ul
        className={`absolute right-0 z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-xl transition-all ${isOpen ? 'pointer-events-auto scale-y-100 opacity-100' : 'pointer-events-none scale-y-95 opacity-0'}`}
        style={{ transformOrigin: 'top' }}
      >
        {options.map(opt => {
          const sel = value === opt;
          return (
            <li
              key={opt}
              onMouseDown={() => { onChange(opt); setIsOpen(false); }}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${sel ? 'font-medium text-[#16A34A]' : 'text-gray-800 hover:bg-gray-50'}`}
            >
              {opt}
              {sel && <Check size={13} strokeWidth={2.5} className="text-[#4a7c59]" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── LeadColFilterPopup ────────────────────────────────────────────── */
interface LeadColFilterPopupProps {
  col: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  initialSelected: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
}

export function LeadColFilterPopup({ col, anchorRef, initialSelected = [], onApply, onClose }: LeadColFilterPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const th = anchorRef.current.closest('th');
      const thRect = th ? th.getBoundingClientRect() : rect;
      const popupWidth = 224;
      const preferredLeft = thRect.left + 20;
      const left = preferredLeft + popupWidth > window.innerWidth
        ? Math.max(4, window.innerWidth - popupWidth - 8)
        : preferredLeft;
      setPos({ top: rect.bottom + 6, left });
    }
  }, [anchorRef]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorRef, onClose]);

  const opts = COL_FILTER_OPTS[col] ?? [];
  const toggle = (v: string) => setSelected(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  return createPortal(
    <div
      ref={popupRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-56 rounded-xl border border-gray-200 bg-white shadow-xl"
    >
      <div className="border-b border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-green-600" strokeWidth={2.5} />
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {col === 'CALL START TIME' ? 'Filter by Date' : `Filter by ${col}`}
          </p>
        </div>
      </div>
      <ul className="max-h-52 overflow-y-auto py-1">
        {opts.map(o => {
          const sel = selected.includes(o);
          return (
            <li
              key={o}
              onMouseDown={e => { e.preventDefault(); toggle(o); }}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-gray-50"
            >
              <input
                type="checkbox"
                readOnly
                checked={sel}
                className="h-4 w-4 rounded border-gray-300 accent-green-600 pointer-events-none"
              />
              <span className={sel ? 'font-medium text-[#16A34A]' : 'text-gray-700'}>{o}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <button
          type="button"
          onClick={() => { setSelected([]); onApply([]); onClose(); }}
          className="text-xs font-medium text-gray-400 transition hover:text-red-500"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => { onApply(selected); onClose(); }}
          className="rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#10883c]"
        >
          Apply
        </button>
      </div>
    </div>,
    document.body
  );
}
