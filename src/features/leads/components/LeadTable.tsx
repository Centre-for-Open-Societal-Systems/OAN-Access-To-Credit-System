import React, { useRef } from 'react';
import { Phone, Filter } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge';
import LeadActionCell from './LeadActionCell';
import LeadEmptyState from './LeadEmptyState';
import { LeadColFilterPopup } from './LeadColFilterPopup';
import { Lead } from '@/features/leads/types/leads.types';

const TABLE_COLS = ['LEAD ID', 'PHONE NUMBER', 'STATUS', 'CALL START TIME', 'ACTIONS'] as const;
const FILTERABLE = ['STATUS', 'CALL START TIME'] as const;

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
    'STATUS':          { value: colStatusFilter,   onApply: onApplyStatusFilter   },
    'CALL START TIME': { value: colCallTimeFilter, onApply: onApplyCallTimeFilter },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border-subtle bg-slate-50">
            <th className="w-12 px-5 py-4">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={onToggleAll}
                className="h-4 w-4 rounded border-border-subtle accent-green-600"
              />
            </th>
            {TABLE_COLS.map(col => {
              const hasFilter = FILTERABLE.includes(col as any);
              const isActive  = hasFilter && ((colFilterCfg[col]?.value?.length ?? 0) > 0);
              return (
                <th
                  key={col}
                  className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
                >
                  {col !== 'ACTIONS' ? (
                    <div className="relative inline-flex items-center gap-1.5">
                      <span className="inline-flex cursor-pointer items-center gap-1 hover:text-text-primary">
                        {col} <span className="text-[11px]">⇅</span>
                      </span>
                      {hasFilter && (
                        <>
                          <button
                            ref={el => { anchorRefs.current[col] = { current: el }; }}
                            type="button"
                            onClick={() => onSetOpenColFilter(prev => prev === col ? null : col)}
                            className={`rounded p-0.5 transition hover:bg-slate-200 ${
                              openColFilter === col || isActive ? 'bg-slate-200 text-green-600' : 'text-text-muted'
                            }`}
                          >
                            <Filter size={12} strokeWidth={2.5} />
                          </button>
                          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                          {openColFilter === col && (
                            <LeadColFilterPopup
                              col={col}
                              anchorRef={{ current: anchorRefs.current[col]?.current ?? null }}
                              initialSelected={colFilterCfg[col]?.value ?? []}
                              onApply={colFilterCfg[col]?.onApply ?? (() => {})}
                              onClose={() => onSetOpenColFilter(null)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ) : col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle bg-white">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-5 py-4">
                  <div className="h-4 w-4 rounded bg-slate-200" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-28 rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-20 rounded-full bg-slate-200" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-24 rounded-full bg-slate-200" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-6 w-20 rounded-xl bg-slate-200" />
                </td>
                <td className="px-5 py-4">
                  <div className="h-4 w-32 rounded-full bg-slate-200" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                  </div>
                </td>
              </tr>
            ))
          ) : visible.length > 0 ? (
            visible.map(l => {
              const key = l.id + l.phone;
              return (
                <tr
                  key={key}
                  className="group transition-colors hover:bg-slate-50/80 cursor-pointer"
                  onClick={() => navigate(`/leads-dashboard/${l.id}`)}
                >
                  <td className="w-12 px-5 py-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(key)}
                      onChange={() => onToggleRow(key)}
                      className="h-4 w-4 rounded border-[#d1d1d1] text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-text-primary group-hover:text-green-700 transition-colors">{l.id}</p>
                    <p className="text-sm text-text-muted">{l.location || 'Unknown'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-text-muted" />
                      <span className="font-medium text-text-primary">{l.phone}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <LeadStatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-text-primary">
                      {l.callStartTime ? new Date(l.callStartTime).toLocaleString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
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
