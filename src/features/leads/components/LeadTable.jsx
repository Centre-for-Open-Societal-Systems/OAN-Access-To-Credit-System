import { useRef } from 'react';
import { Phone, Filter } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge.jsx';
import LeadActionCell from './LeadActionCell.jsx';
import LeadEmptyState from './LeadEmptyState.jsx';
import { LeadColFilterPopup } from './LeadColFilterPopup.jsx';

const TABLE_COLS = ['LEAD ID', 'PHONE NUMBER', 'STATUS', 'CALL START TIME', 'ACTIONS'];
const FILTERABLE = ['STATUS', 'CALL START TIME'];

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
}) {
  const anchorRefs = useRef({});

  const colFilterCfg = {
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
              const hasFilter = FILTERABLE.includes(col);
              const isActive  = hasFilter && (colFilterCfg[col]?.value.length > 0);
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
                              anchorRef={{ current: anchorRefs.current[col]?.current }}
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
        <tbody className="divide-y divide-border-subtle">
          {visible.length === 0 ? (
            <LeadEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
          ) : visible.map((lead, i) => {
            const rowKey = lead.id + lead.phone;
            return (
              <tr
                key={rowKey}
                className={`transition-colors ${
                  selectedRows.includes(rowKey) ? 'bg-green-50/40' : 'hover:bg-slate-50'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowKey)}
                    onChange={() => onToggleRow(rowKey)}
                    className="h-4 w-4 rounded border-border-subtle accent-green-600"
                  />
                </td>
                <td className="px-5 py-4">
                  <div
                    className="cursor-pointer text-base font-bold text-[#16A34A] hover:underline"
                    onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)}
                  >
                    {lead.id}
                  </div>
                  <div className="mt-0.5 text-sm text-text-muted">{lead.location}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-1.5 text-sm text-text-primary">
                    <Phone size={14} className="text-text-muted" />
                    {lead.phone}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm text-text-primary">{lead.callStartTime}</div>
                  <div className="mt-0.5 text-sm text-text-muted">Duration: {lead.callDuration}</div>
                </td>
                <td className="px-5 py-4">
                  <LeadActionCell lead={lead} navigate={navigate} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LeadTable;
