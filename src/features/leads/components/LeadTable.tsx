import { Lead } from '@/features/leads/types/leads.types';
import { ArrowDown, ArrowUp, ArrowUpDown, Filter, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import LeadActionCell, { getLeadRoute } from './LeadActionCell';
import { LeadColFilterPopup } from './LeadColFilterPopup';
import { TableEmptyState } from '@/components/ui/TableEmptyState';
import { LeadStatusBadge } from './LeadStatusBadge';

type Align = 'left' | 'center' | 'right';

interface ColumnDef {
  id: string;
  label: string;
  align: Align;
  isFilterable?: boolean;
  isSortable?: boolean;
  minWidth?: string;
}

const TABLE_COLS: ColumnDef[] = [
  { id: 'LEAD ID', label: 'LEAD ID', align: 'left' },
  { id: 'PHONE NUMBER', label: 'PHONE NUMBER', align: 'center' },
  { id: 'STATUS', label: 'STATUS', align: 'center', isFilterable: true },
  { id: 'LOAN TYPE', label: 'LOAN TYPE', align: 'center', isFilterable: true },
  { id: 'LOAN AMOUNT', label: 'LOAN AMOUNT', align: 'center', isSortable: true },
  { id: 'STATUS CHANGE DATE', label: 'STATUS CHANGE DATE', align: 'center', isSortable: true, minWidth: '200px' },
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
  sortBy?: 'loan_amount' | 'creation' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  onSortChange?: ((sortBy?: 'loan_amount' | 'creation' | undefined, sortOrder?: 'asc' | 'desc' | undefined) => void) | undefined;
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
  sortBy,
  sortOrder,
  onSortChange,
}: LeadTableProps) {
  const anchorRefs = useRef<Record<string, { current: HTMLButtonElement | null }>>({});

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(1118);

  const isSyncingTable = useRef(false);
  const isSyncingScrollbar = useRef(false);

  useEffect(() => {
    if (!tableContainerRef.current) return;

    setTableScrollWidth(tableContainerRef.current.scrollWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTableScrollWidth(entry.target.scrollWidth);
      }
    });

    observer.observe(tableContainerRef.current);
    return () => observer.disconnect();
  }, [visible, isLoading]);

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingTable.current) {
      isSyncingTable.current = false;
      return;
    }
    if (scrollbarRef.current) {
      isSyncingScrollbar.current = true;
      scrollbarRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleScrollbarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScrollbar.current) {
      isSyncingScrollbar.current = false;
      return;
    }
    if (tableContainerRef.current) {
      isSyncingTable.current = true;
      tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const colFilterCfg: Record<string, { value: string[]; onApply: (selected: string[]) => void }> = {
    'STATUS': { value: colStatusFilter, onApply: onApplyStatusFilter },
    'LOAN TYPE': { value: colCallTimeFilter, onApply: onApplyCallTimeFilter },
  };

  const getCellClassName = (align: Align, isHeader = false) => {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const typoClass = isHeader ? '' : 'font-sans text-base text-[#232F34]';
    return `${CELL_CLASS} ${alignClass} ${typoClass}`.trim();
  };

  const renderCellContent = (colId: string, l: Lead) => {
    switch (colId) {
      case 'LEAD ID': {
        return (
          <div className="flex flex-col items-start justify-start h-full">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(getLeadRoute(l)); }}
              className="text-xs font-semibold text-[#16A34A] hover:underline text-left"
            >
              <span className='font-semibold'>{l.id}</span>
            </button>
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
            <span className="whitespace-nowrap text-sm">
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
            <span className="flex flex-col text-md text-gray-500">
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
    <div className="flex flex-col min-h-[400px] relative">
      <div
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        className="overflow-x-auto w-full flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2"
      >
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
              {/* The anchor button ref (read further below, for the filter popup) can
                only be populated after that button has rendered and attached its
                ref in an earlier commit, so this is safe in practice even though
                it technically reads a ref's value during render. */}
              {/* eslint-disable-next-line react-hooks/refs */}
              {TABLE_COLS.map(col => {
                const isActive = col.isFilterable && ((colFilterCfg[col.id]?.value?.length ?? 0) > 0);

                return (
                  <th key={col.id} className={getCellClassName(col.align, true)} style={col.minWidth ? { minWidth: col.minWidth } : undefined}>
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
                            className={`rounded p-0.5 transition hover:bg-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${openColFilter === col.id || isActive ? 'text-[#1E6865]' : 'text-[#AEB4BA]'}`}
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
                      {col.isSortable && (() => {
                        const targetSortBy = col.id === 'LOAN AMOUNT' ? 'loan_amount' : 'creation';
                        const isSortActive = sortBy === targetSortBy;
                        return (
                          <button
                            type="button"
                            title={`Sort by ${col.label}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!onSortChange) return;
                              if (!isSortActive) {
                                onSortChange(targetSortBy, 'desc');
                              } else if (sortOrder === 'desc') {
                                onSortChange(targetSortBy, 'asc');
                              } else {
                                onSortChange(undefined, undefined);
                              }
                            }}
                            className={`inline-flex items-center justify-center p-1 rounded transition-colors hover:bg-slate-200 outline-none ${isSortActive ? 'text-[#16A34A] font-bold' : 'text-[#AEB4BA] hover:text-[#374151]'
                              }`}
                          >
                            {isSortActive ? (
                              sortOrder === 'asc' ? <ArrowUp size={14} strokeWidth={2.5} /> : <ArrowDown size={14} strokeWidth={2.5} />
                            ) : (
                              <ArrowUpDown size={14} strokeWidth={2} />
                            )}
                          </button>
                        );
                      })()}
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
                    // Not given role="button"/tabIndex here — that would override the row's
                    // implicit ARIA `row` role (breaking table-browse-mode header association
                    // for screen readers) and nest an interactive control around the real
                    // checkbox/action buttons inside it. The Lead ID cell below is a real
                    // <button> providing the same navigation, reachable via keyboard/AT;
                    // this onClick is just a mouse-convenience "click anywhere on the row".
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
              <TableEmptyState
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
                colSpan={8}
                emptyTitle="No leads yet"
                emptyDescription="Create your first lead to get started with the pipeline."
                filteredTitle="No leads match your filters"
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky scrollbar container */}
      <div
        ref={scrollbarRef}
        onScroll={handleScrollbarScroll}
        className="sticky bottom-0 z-20 w-full overflow-x-auto [scrollbar-width:auto] [scrollbar-color:auto] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-[#f1f5f9] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#16A34A] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#15803d]"
      >
        <div style={{ width: tableScrollWidth, height: '1px' }}></div>
      </div>
    </div>
  );
}

export default LeadTable;
