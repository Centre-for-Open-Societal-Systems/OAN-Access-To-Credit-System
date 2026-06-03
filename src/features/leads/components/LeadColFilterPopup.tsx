import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { COL_FILTER_OPTS } from '../constants/leads.constants';


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
