import { useRef } from 'react';
import { Phone, Filter } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';
import LeadActionCell, { getLeadRoute } from './LeadActionCell';
import LeadEmptyState from './LeadEmptyState';
import { LeadColFilterPopup } from './LeadColFilterPopup';
import { Lead } from '@/features/leads/types/leads.types';

type Align = 'left' | 'center' | 'right';

interface ColumnDef {
  id: string;
  label: string;
  align: Align;
  isFilterable?: boolean;
  isSortable?: boolean;
}

const TABLE_COLS: ColumnDef[] = [
  { id: 'LEAD ID', label: 'LEAD ID', align: 'left' },
  { id: 'PHONE NUMBER', label: 'PHONE NUMBER', align: 'center' },
  { id: 'STATUS', label: 'STATUS', align: 'center', isFilterable: true },
  { id: 'LOAN TYPE', label: 'LOAN TYPE', align: 'center', isFilterable: true },
  { id: 'LOAN AMOUNT', label: 'LOAN AMOUNT', align: 'center', isSortable: true },
  { id: 'STATUS CHANGE DATE', label: 'STATUS CHANGE DATE', align: 'center' },
  { id: 'ACTIONS', label: 'ACTIONS', align: 'center' }
];

const CELL_CLASS = "w-table-cell min-w-table-cell max-w-table-cell px-5 py-3 align-middle";

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
  const firstPart = parts[0] ?? '';
  let lastThree = firstPart.substring(firstPart.length - 3);
  const otherParts = firstPart.substring(0, firstPart.length - 3);
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

  const getCellClassName = (align: Align, isHeader = false) => {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const typoClass = isHeader ? '' : 'font-sans font-medium text-base text-[#232F34]';
    return `${CELL_CLASS} ${alignClass} ${typoClass}`.trim();
  };

  const renderCellContent = (colId: string, l: Lead) => {
    switch (colId) {
      case 'LEAD ID': {
        return (
          <div className="flex flex-col items-start justify-start h-full">
            <span className="text-base font-semibold text-[#16A34A] hover:underline">
              {l.id}
            </span>
            {l.location && (
              <span className="mt-1 block font-normal text-sm text-[#6B7280] text-left">
                {l.location}
              </span>
            )}
          </div>
        );
      }
      case 'PHONE NUMBER':
        return (
          <div className="flex items-center justify-center gap-2">
            <Phone size={16} className="text-[#6B7280] shrink-0" />
            <span className="whitespace-nowrap text-base">
              {l.phone}
            </span>
          </div>
        );
      case 'STATUS':
        return (
          <div className="flex justify-center w-full">
            <LeadStatusBadge status={l.status} />
          </div>
        );
      case 'LOAN TYPE':
        return <>{l.loanType}</>;
      case 'LOAN AMOUNT':
        return (
          <span className="tracking-[-0.150391px]">
            {!!l.loanAmount ? formatCurrency(l.loanAmount) : ''}
          </span>
        );
      case 'STATUS CHANGE DATE':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="flex flex-col text-sm text-gray-500">
              {formatStatusDate(l.creation)}
            </span>
          </div>
        );
      case 'ACTIONS':
        return (
          <div className="flex justify-center w-full">
            <LeadActionCell lead={l} navigate={navigate} />
          </div>
        );
      default:
        return null;
    }
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
              const isActive = col.isFilterable && ((colFilterCfg[col.id]?.value?.length ?? 0) > 0);

              return (
                <th key={col.id} className={getCellClassName(col.align, true)}>
                  <div className={`relative flex items-center gap-1.5 whitespace-nowrap ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#6B7280]">
                      {col.label}
                    </span>

                    {col.isFilterable && (
                      <div className="relative inline-flex items-center">
                        <button
                          ref={el => { anchorRefs.current[col.id] = { current: el }; }}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSetOpenColFilter(prev => prev === col.id ? null : col.id);
                          }}
                          className={`rounded p-0.5 transition hover:bg-slate-200 outline-none ${openColFilter === col.id || isActive ? 'text-[#1E6865]' : 'text-[#AEB4BA]'}`}
                        >
                          <Filter size={16} strokeWidth={2.5} />
                        </button>
                        {isActive && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#1E6865]" />}
                      </div>
                    )}
                    {col.isFilterable && openColFilter === col.id && (
                      <LeadColFilterPopup
                        col={col.id}
                        anchorRef={{ current: anchorRefs.current[col.id]?.current ?? null }}
                        initialSelected={colFilterCfg[col.id]?.value ?? []}
                        onApply={colFilterCfg[col.id]?.onApply ?? (() => { })}
                        onClose={() => onSetOpenColFilter(null)}
                      />
                    )}
                    {col.isSortable && (
                      <span className="inline-flex cursor-pointer text-[#AEB4BA] hover:text-[#3A474E] text-[12px] select-none">

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
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-[#F1F3F4] h-[64px]">
                <td className="w-[56px] p-0 text-center align-middle">
                  <div className="h-[13px] w-[13px] rounded-[2.5px] bg-slate-200 mx-auto" />
                </td>
                {TABLE_COLS.map((col) => (
                  <td key={col.id} className={getCellClassName(col.align)}>
                    <div className={`h-4 rounded bg-slate-200 ${col.id === 'LEAD ID' || col.id === 'STATUS CHANGE DATE' ? 'w-24' : 'w-20'} ${col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''}`} />
                  </td>
                ))}
              </tr>
            ))
          ) : visible.length > 0 ? (
            visible.map(l => {
              const key = l.id + l.phone;

              const isSelected = selectedRows.includes(key);
              const isVisitScheduled = l.scheduleStatus?.toLowerCase() === 'scheduled' || l.actionType === 'visit-scheduled';

              const rowBgClass = isSelected
                ? "bg-[#F1F5F9] border-t border-[#F1F3F4] h-[64px] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                : isVisitScheduled
                  ? "bg-white border-t border-[#F1F3F4] h-[64px] hover:bg-[rgba(240,253,250,0.5)] transition-colors cursor-pointer"
                  : "bg-white border-t border-[#F1F3F4] h-[64px] hover:bg-[#f7fafd] transition-colors cursor-pointer";

              return (
                <tr
                  key={key}
                  className={rowBgClass}
                  onClick={() => navigate(getLeadRoute(l))}
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

                  {TABLE_COLS.map((col) => (
                    <td
                      key={col.id}
                      className={getCellClassName(col.align)}
                      onClick={col.id === 'ACTIONS' ? (e) => e.stopPropagation() : undefined}
                    >
                      {renderCellContent(col.id, l)}
                    </td>
                  ))}
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
