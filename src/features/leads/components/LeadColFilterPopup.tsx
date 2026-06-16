import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectLoanTypesOptions, selectLeadStatusesOptions } from '@/features/new-lead/store/newLeadSlice';


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
    // Positioning is now handled by absolute positioning relative to the column header.
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


  const loanTypesOptions = useAppSelector(selectLoanTypesOptions);
  const leadStatusesOptions = useAppSelector(selectLeadStatusesOptions);

  const opts = col === 'STATUS'
    ? leadStatusesOptions.filter(o => o !== 'All')
    : col === 'LOAN TYPE'
      ? loanTypesOptions
      : [];
  const toggle = (v: string) => setSelected(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  return (
    <div
      ref={popupRef}
      className="loan-filter-popup absolute top-full left-0 mt-2 z-[99] flex min-w-[240px] w-max flex-col rounded-xl border border-gray-200 bg-white shadow-xl normal-case tracking-normal text-gray-900"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
        <Filter size={16} className="text-emerald-600" />
        {col === 'CALL START TIME' ? 'FILTER BY DATE' : `FILTER BY ${col}`}
      </div>
      <div className="flex flex-col max-h-[300px] overflow-y-auto font-medium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {opts.map((o, idx) => {
          const sel = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={e => { e.stopPropagation(); toggle(o); }}
              className={`flex items-center gap-4 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-gray-50 text-[#4B5563] text-left ${idx !== opts.length - 1 ? 'border-b border-[#F3F3F3]' : ''}`}
            >
              <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border transition-all duration-200 ease-in-out rounded-sm ${sel ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-[#9CA3AF] bg-white'}`}>
                <Check size={12} strokeWidth={3} className={`transition-all duration-200 ease-in-out rounded-sm  ${sel ? 'scale-100 opacity-100' : 'scale-50 opacity-0 rounded-sm'}`} />
              </span>
              <span className="flex-1 text-[15px] whitespace-normal">{o}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 p-3 bg-gray-50/50 rounded-b-xl font-bold">
        <button
          type="button"
          onClick={() => { setSelected([]); onApply([]); onClose(); }}
          className="text-[17px] font-bold text-gray-500 hover:text-gray-600"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => { onApply(selected); onClose(); }}
          className="rounded-lg bg-[#16A34A] px-5 py-2.5 text-[17px] font-bold text-white shadow-sm transition hover:bg-[#10883c]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
