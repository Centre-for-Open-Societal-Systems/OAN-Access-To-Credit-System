import React, { useRef } from 'react';
import { Phone, Filter } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge';
import LeadActionCell from './LeadActionCell';
import LeadEmptyState from './LeadEmptyState';
import { LeadColFilterPopup } from './LeadColFilterPopup';
import { Lead } from '@/features/leads/types/leads.types';

const TABLE_COLS = [
  'LEAD ID',
  'PHONE NUMBER',
  'STATUS',
  'LOAN TYPE',
  'LOAN AMOUNT',
  'STATUS CHANGE DATE',
  'ACTIONS'
] as const;

const FILTERABLE = ['STATUS', 'LOAN TYPE'] as const;

interface LeadTableProps {
  visible: Lead[];
  selectedRows: string[];
  allChecked: boolean;
  openColFilter: string | null;
  colStatusFilter: string[];
  colCallTimeFilter: string[];
  navigate: (path: string) => void;
  hasFilters: boolean;
  onToggleAll: () => void;
  onToggleRow: (key: string) => void;
  onSetOpenColFilter: React.Dispatch<React.SetStateAction<string | null>>;
  onApplyStatusFilter: (selected: string[]) => void;
  onApplyCallTimeFilter: (selected: string[]) => void;
  onClearFilters: () => void;
  isLoading: boolean;
}

// Utility to format date to: May 28, 2026, 10:42 AM
const formatStatusDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
};

// Utility to format currency to: ETB 1,50,000 (Indian grouping style)
const formatCurrency = (amt?: number | string): string => {
  if (amt === undefined || amt === null || amt === '') return '';
  const num = typeof amt === 'string' ? parseFloat(amt.replace(/[^\d.]/g, '')) : amt;
  if (isNaN(num)) return amt.toString();

  const parts = num.toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherParts = parts[0].substring(0, parts[0].length - 3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `ETB ${res}`;
};

function LeadTable({
  visible,
  selectedRows,
  allChecked,
  openColFilter,
  colStatusFilter,
  colCallTimeFilter,
  navigate,
  hasFilters,
  onToggleAll,
  onToggleRow,
  onSetOpenColFilter,
  onApplyStatusFilter,
  onApplyCallTimeFilter,
  onClearFilters,
  isLoading,
}: LeadTableProps) {
  const anchorRefs = useRef<Record<string, { current: HTMLButtonElement | null }>>({});

  const colFilterCfg: Record<string, { value: string[]; onApply: (selected: string[]) => void }> = {
    'STATUS': { value: colStatusFilter, onApply: onApplyStatusFilter },
    'LOAN TYPE': { value: colCallTimeFilter, onApply: onApplyCallTimeFilter },
  };

  return (
    <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[1118px] table-fixed border-collapse">
        <thead>
          <tr className="border-b border-[#EDEFF1] bg-[rgba(248,250,252,0.5)] h-[57px] select-none">
            <th className="w-[56px] min-w-[56px] max-w-[56px] p-0 text-center align-middle">
              <div className="flex items-center justify-center h-full">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={onToggleAll}
                  className="h-[13px] w-[13px] rounded-[2.5px] border border-[#767676] bg-white accent-[#00A63E] cursor-pointer outline-none"
                />
              </div>
            </th>
            {TABLE_COLS.map(col => {
              const hasFilter = FILTERABLE.includes(col as any);
              const isActive = hasFilter && ((colFilterCfg[col]?.value?.length ?? 0) > 0);
              const isAmount = col === 'LOAN AMOUNT';
              const isActions = col === 'ACTIONS';

              return (
                <th
                  key={col}
                  className={`w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle ${isActions ? 'text-center' : 'text-left'
                    }`}
                >
                  <div className={`flex items-center gap-1.5 whitespace-nowrap ${isActions ? 'justify-center' : 'justify-start'}`}>
                    <span className="font-sans font-medium text-[12px] uppercase tracking-[0.6px] text-[#6B7280]">
                      {col}
                    </span>

                    {hasFilter && (
                      <div className="relative inline-flex items-center">
                        <button
                          ref={el => { anchorRefs.current[col] = { current: el }; }}
                          type="button"
                          onClick={() => onSetOpenColFilter(prev => prev === col ? null : col)}
                          className={`rounded p-0.5 transition hover:bg-slate-200 outline-none ${openColFilter === col || isActive ? 'text-[#1E6865]' : 'text-[#AEB4BA]'
                            }`}
                        >
                          <Filter size={12} strokeWidth={2.5} />
                        </button>
                        {isActive && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#1E6865]" />}
                        {openColFilter === col && (
                          <LeadColFilterPopup
                            col={col}
                            anchorRef={{ current: anchorRefs.current[col]?.current ?? null }}
                            initialSelected={colFilterCfg[col]?.value ?? []}
                            onApply={colFilterCfg[col]?.onApply ?? (() => { })}
                            onClose={() => onSetOpenColFilter(null)}
                          />
                        )}
                      </div>
                    )}

                    {isAmount && (
                      <span className="inline-flex cursor-pointer text-[#AEB4BA] hover:text-[#3A474E] text-[10px] select-none">
                        ⇅
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-[#F1F3F4] h-[64px]">
                <td className="w-[56px] p-0 text-center align-middle">
                  <div className="h-[13px] w-[13px] rounded-[2.5px] bg-slate-200 mx-auto" />
                </td>
                {Array.from({ length: 7 }).map((_, idx) => (
                  <td key={idx} className="w-[151.71px] px-5 py-3">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </td>
                ))}
              </tr>
            ))
          ) : visible.length > 0 ? (
            visible.map(l => {
              const key = l.id + l.phone;
              const hasLoanAmount = !!(l.loanAmount || l.loan_amount);

              // Custom Background for Visit Scheduled row status
              const isVisitScheduled = l.status?.toLowerCase() === 'visit scheduled' || l.actionType === 'visit-scheduled';
              const rowBgClass = isVisitScheduled
                ? "bg-[rgba(240,253,250,0.3)] border-t border-[#F1F3F4] h-[64px] hover:bg-[rgba(240,253,250,0.5)] transition-colors cursor-pointer"
                : "bg-white border-t border-[#F1F3F4] h-[64px] hover:bg-slate-50/50 transition-colors cursor-pointer";

              return (
                <tr
                  key={key}
                  className={rowBgClass}
                  onClick={() => navigate(`/leads-dashboard/${l.id}`)}
                >
                  <td className="w-[56px] min-w-[56px] max-w-[56px] p-0 text-center align-middle" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(key)}
                        onChange={() => onToggleRow(key)}
                        className="h-[13px] w-[13px] rounded-[2.5px] border border-[#767676] bg-white accent-[#00A63E] cursor-pointer outline-none"
                      />
                    </div>
                  </td>

                  {/* LEAD ID */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle">
                    <div className="flex flex-col items-start justify-center h-full">
                      <span className="font-sans font-medium text-[14px] leading-[20px] text-[#00A63E] hover:underline">
                        {l.id}
                      </span>
                      {l.location && (
                        <span className="font-sans font-normal text-[12px] leading-[16px] text-[#6B7280]">
                          {l.location}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PHONE NUMBER */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-[#6B7280] shrink-0" />
                      <span className="font-sans font-medium text-[14px] leading-[20px] text-[#232F34] whitespace-nowrap">
                        {l.phone}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle">
                    <LeadStatusBadge status={l.status} />
                  </td>

                  {/* LOAN TYPE */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle">
                    <span className="font-sans font-medium text-[14px] leading-[20px] text-[#232F34]">
                      {l.loanType || l.loan_type || ''}
                    </span>
                  </td>

                  {/* LOAN AMOUNT */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle">
                    <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.150391px] text-[#232F34]">
                      {hasLoanAmount ? formatCurrency(l.loanAmount || l.loan_amount) : ''}
                    </span>
                  </td>

                  {/* STATUS CHANGE DATE */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle">
                    <div className="flex flex-col items-start justify-center h-full">
                      <span className="font-sans font-normal text-[14px] leading-[20px] text-[#3A474E]">
                        {formatStatusDate(l.callStartTime || l.modified)}
                      </span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="w-[151.71px] min-w-[151.71px] max-w-[151.71px] px-5 py-3 align-middle text-right" onClick={e => e.stopPropagation()}>
                    <LeadActionCell lead={l} navigate={navigate} />
                  </td>
                </tr>
              );
            })
          ) : (
            <LeadEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeadTable;
