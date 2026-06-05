import { useState, useRef, useEffect, memo } from 'react';
import { Filter, Check, Phone, Eye, ArrowUpDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPagedRows,
  selectTableStatusFilters,
  selectTableTypeFilters,
  toggleTableStatusFilter,
  toggleTableTypeFilter,
} from '../store/loanDashboardSlice';

export interface LoanTableRow {
  id: string;
  applicant: string;
  phone: string;
  loanAmount: string;
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

const STATUS_OPTIONS = ['Approved', 'Processing', 'Rejected',];
const LOAN_TYPE_OPTIONS = [
  'Input loan (seeds, agrochemicals)',
  'Agricultural term loan',
  'Smallholder short-term loan',
  'Land loan',
  'Farm equipment loan',
  'Smallholder farmer direct loan'
];

const LoanTable = memo(({ onView }: LoanTableProps) => {
  const dispatch = useAppDispatch();
  const rows: LoanTableRow[] = useAppSelector(selectPagedRows);

  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [loanTypeFilterOpen, setLoanTypeFilterOpen] = useState(false);

  const selectedStatuses = useAppSelector(selectTableStatusFilters);
  const selectedLoanTypes = useAppSelector(selectTableTypeFilters);

  const statusRef = useRef<HTMLDivElement>(null);
  const loanTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusFilterOpen(false);
      if (loanTypeRef.current && !loanTypeRef.current.contains(e.target as Node)) setLoanTypeFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = (val: string) => {
    dispatch(toggleTableStatusFilter(val));
  };

  const toggleLoanType = (val: string) => {
    dispatch(toggleTableTypeFilter(val));
  };

  const clearStatusFilters = () => {
    selectedStatuses.forEach(s => dispatch(toggleTableStatusFilter(s)));
    setStatusFilterOpen(false);
  };

  const clearLoanTypeFilters = () => {
    selectedLoanTypes.forEach(s => dispatch(toggleTableTypeFilter(s)));
    setLoanTypeFilterOpen(false);
  };

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full border-collapse text-left text-base text-gray-500 whitespace-nowrap">
        <thead className="bg-[#fafafa] text-[13px] font-bold uppercase tracking-wider text-gray-400">
          <tr>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">Application ID</th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">PHONE NUMBER</th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">
              <div className="relative inline-flex items-center gap-1.5 cursor-pointer" ref={statusRef}>
                STATUS <Filter size={16} className="text-gray-400" onClick={() => setStatusFilterOpen(!statusFilterOpen)} />
                {statusFilterOpen && (
                  <div className="absolute left-0 top-[calc(100%+0.4rem)] z-50 flex w-[240px] flex-col rounded-xl border border-gray-200 bg-white shadow-xl normal-case tracking-normal text-gray-900" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                      <Filter size={16} className="text-emerald-600" /> FILTER BY STATUS
                    </div>
                    <div className="flex flex-col p-2 max-h-[200px] overflow-y-auto">
                      {STATUS_OPTIONS.map((opt) => {
                        const isChecked = selectedStatuses.includes(opt);
                        return (
                          <button key={opt} type="button" onClick={() => toggleStatus(opt)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-gray-50 text-gray-700">
                            <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border ${isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                              {isChecked && <Check size={14} strokeWidth={3} />}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
                      <button onClick={clearStatusFilters} className="text-base font-medium text-gray-400 hover:text-gray-600">Clear</button>
                      <button onClick={() => setStatusFilterOpen(false)} className="rounded-lg bg-[#10b981] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#059669]">Apply</button>
                    </div>
                  </div>
                )}
              </div>
            </th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">
              <div className="relative inline-flex items-center gap-1.5 cursor-pointer" ref={loanTypeRef}>
                LOAN TYPE <Filter size={16} className="text-gray-400" onClick={() => setLoanTypeFilterOpen(!loanTypeFilterOpen)} />
                {loanTypeFilterOpen && (
                  <div className="absolute left-0 top-[calc(100%+0.4rem)] z-50 flex w-[240px] flex-col rounded-xl border border-gray-200 bg-white shadow-xl normal-case tracking-normal text-gray-900" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                      <Filter size={16} className="text-emerald-600" /> FILTER BY LOAN TYPE
                    </div>
                    <div className="flex flex-col p-2 max-h-[200px] overflow-y-auto">
                      {LOAN_TYPE_OPTIONS.map((opt) => {
                        const isChecked = selectedLoanTypes.includes(opt);
                        return (
                          <button key={opt} type="button" onClick={() => toggleLoanType(opt)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-gray-50 text-gray-700">
                            <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border ${isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                              {isChecked && <Check size={14} strokeWidth={3} />}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
                      <button onClick={clearLoanTypeFilters} className="text-base font-medium text-gray-400 hover:text-gray-600">Clear</button>
                      <button onClick={() => setLoanTypeFilterOpen(false)} className="rounded-lg bg-[#10b981] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#059669]">Apply</button>
                    </div>
                  </div>
                )}
              </div>
            </th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">
              <div className="inline-flex items-center gap-1.5 cursor-pointer">
                LOAN AMOUNT
              </div>
            </th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold text-center leading-tight">
              STATUS CHANGE<br />DATE
            </th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-base text-gray-500">
                No applications found for this period.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
              let dotColor = "bg-gray-400";

              const statusLower = row.status.toLowerCase();
              if (statusLower.includes('processing') || statusLower.includes('active') || row.statusTone === 'info') {
                badgeColor = "bg-blue-50 text-blue-500 border border-blue-200";
                dotColor = "bg-blue-500";
              } else if (statusLower.includes('approved') || statusLower.includes('verified') || row.statusTone === 'success') {
                badgeColor = "bg-emerald-50 text-emerald-600 border border-emerald-200";
                dotColor = "bg-emerald-500";
              } else if (statusLower.includes('rejected') || row.statusTone === 'danger') {
                badgeColor = "bg-red-50 text-red-500 border border-red-200";
                dotColor = "bg-red-500";
              }

              // Parse date parts. In slice, updated is 'May 28, 2026 · 09:15 AM'
              const updatedParts = row.updated.split(' · ');
              const datePart = updatedParts[0];
              const timePart = updatedParts[1];

              return (
                <tr key={`${row.id}-${i}`} className="transition-colors hover:bg-gray-50/50 group">
                  <td className="px-6 py-5">
                    <strong className="block text-base font-semibold text-emerald-500">{row.id}</strong>
                    {row.applicant !== 'Unknown Applicant' && (
                      <span className="mt-1 block text-sm text-gray-400">{row.applicant}</span>
                    )}
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-700">
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-gray-400" />
                      {row.phone}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${badgeColor}`}>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                      {row.status.replace('Verified', 'Approved').replace('Active', 'Processing')}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-700">{row.type}</td>
                  <td className="px-6 py-5 font-medium text-gray-700">{row.loanAmount}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col text-sm text-gray-500">
                      <span>{datePart},</span>
                      <span>{timePart}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => onView?.(row)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
                      >
                        <Eye size={16} className="text-gray-400" />
                        View
                      </button>
                    </div>
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
