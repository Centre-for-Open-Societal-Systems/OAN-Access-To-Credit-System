import { useState, useRef, useEffect, memo } from 'react';
import { Filter, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPagedRows,
  selectSelectedStatuses,
  toggleStatus,
  toggleAllStatuses
} from '../store/loanDashboardSlice';

const STATUS_OPTIONS = [
  { label: 'Action Required', value: 'danger' },
  { label: 'Pending Review', value: 'info' },
  { label: 'Draft', value: 'neutral' },
];

export interface LoanTableRow {
  id: string;
  applicant: string;
  type: string;
  status: string;
  statusTone: string;
  updated: string;
  action: string;
  timestamp: number;
  [key: string]: any; // for other raw fields
}

interface LoanTableProps {
  onView?: (row: LoanTableRow) => void;
}

const LoanTable = memo(({ onView }: LoanTableProps) => {
  const dispatch = useAppDispatch();
  const rows: LoanTableRow[] = useAppSelector(selectPagedRows);
  const selectedStatuses = useAppSelector(selectSelectedStatuses);

  const allChecked = selectedStatuses.length === 3;

  const [filterOpen, setFilterOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-text-muted">
        <thead className="bg-[#f9fafb] text-[0.68rem] font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="rounded-tl-xl border-b border-[#e9e9e9] px-5 py-3">Application ID / Applicant</th>
            <th className="border-b border-[#e9e9e9] px-5 py-3">Type</th>
            <th className="border-b border-[#e9e9e9] px-5 py-3">
              <div className="relative inline-flex items-center gap-1.5" ref={statusDropdownRef}>
                <span>Status</span>
                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`inline-grid h-6 w-6 place-items-center rounded-md transition-colors ${filterOpen
                    ? 'bg-blue-50 text-blue-600'
                    : !allChecked
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                >
                  <Filter size={12} strokeWidth={2.5} />
                </button>

                {filterOpen && (
                  <div className="absolute left-0 top-[calc(100%+0.4rem)] z-50 flex min-w-[12rem] flex-col gap-0.5 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl font-normal normal-case tracking-normal text-text-primary">
                    <button
                      type="button"
                      onClick={() => dispatch(toggleAllStatuses())}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.82rem] font-medium transition-colors hover:bg-gray-50 ${allChecked ? 'bg-blue-50/50 font-semibold text-blue-600' : ''}`}
                    >
                      <span className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${allChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                        {allChecked && <Check size={10} strokeWidth={3} className="text-white" />}
                      </span>
                      All
                    </button>
                    {STATUS_OPTIONS.map((opt) => {
                      const isChecked = selectedStatuses.includes(opt.value);
                      let dotColor = "bg-gray-400";
                      if (opt.value === 'danger') dotColor = "bg-red-500";
                      if (opt.value === 'info') dotColor = "bg-blue-500";

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => dispatch(toggleStatus(opt.value))}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.82rem] font-medium transition-colors hover:bg-gray-50 ${isChecked ? 'bg-blue-50/50 font-semibold text-blue-600' : ''}`}
                        >
                          <span className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${isChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
                            {isChecked && <Check size={10} strokeWidth={3} className="text-white" />}
                          </span>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </th>
            <th className="border-b border-[#e9e9e9] px-5 py-3">Last Updated</th>
            <th className="rounded-tr-xl border-b border-[#e9e9e9] px-5 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e9e9e9]">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-text-muted">
                No applications found for this period.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
              let dotColor = "bg-gray-400";
              if (row.statusTone === 'danger') {
                badgeColor = "bg-red-50 text-red-600 border-red-200";
                dotColor = "bg-red-500";
              }
              if (row.statusTone === 'info') {
                badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                dotColor = "bg-blue-500";
              }
              if (row.statusTone === 'success') {
                badgeColor = "bg-green-50 text-green-700 border-green-200";
                dotColor = "bg-green-500";
              }

              return (
                <tr key={`${row.id}-${i}`} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <strong className="block text-sm font-bold text-text-primary">{row.id}</strong>
                    <span className="mt-0.5 inline-block text-xs text-text-muted">{row.applicant}</span>
                  </td>
                  <td className="px-5 py-4">{row.type}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">{row.updated}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onView?.(row)}
                      className="inline-flex w-20 items-center justify-center rounded-lg border border-gray-200 bg-white py-1.5 text-xs font-bold text-text-primary shadow-sm transition-all hover:-translate-y-[1px] hover:shadow"
                    >
                      {row.action}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

LoanTable.displayName = 'LoanTable';
export default LoanTable;
