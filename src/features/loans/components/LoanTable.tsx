import { useState, useRef, useEffect, memo } from 'react';
import { Filter, Check, Phone, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPagedRows,
  selectTableStatusFilters,
  selectTableTypeFilters,
  setTableStatusFilters,
  setTableTypeFilters,
} from '../store/loanDashboardSlice';
import LoanEmptyState from './LoanEmptyState';
import { selectLeadStatusesOptions, selectLoanTypesOptions } from '@/features/new-lead/store/newLeadSlice';

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
  application_id?: string;
  region?: string;
  amount?: string;
  loanTerm?: string;
}

interface LoanTableProps {
  onView?: (row: LoanTableRow) => void;
}

const LoanTable = memo(({ onView }: LoanTableProps) => {
  const dispatch = useAppDispatch();
  const rows: LoanTableRow[] = useAppSelector(selectPagedRows);

  const statusOptions = useAppSelector(selectLeadStatusesOptions);
  const loanTypeOptions = useAppSelector(selectLoanTypesOptions);

  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [loanTypeFilterOpen, setLoanTypeFilterOpen] = useState(false);

  const selectedStatuses = useAppSelector(selectTableStatusFilters);
  const selectedLoanTypes = useAppSelector(selectTableTypeFilters);

  const [localStatuses, setLocalStatuses] = useState<string[]>([]);
  const [localLoanTypes, setLocalLoanTypes] = useState<string[]>([]);

  useEffect(() => {
    if (statusFilterOpen) setLocalStatuses(selectedStatuses);
  }, [statusFilterOpen, selectedStatuses]);

  useEffect(() => {
    if (loanTypeFilterOpen) setLocalLoanTypes(selectedLoanTypes);
  }, [loanTypeFilterOpen, selectedLoanTypes]);

  const statusRef = useRef<HTMLButtonElement>(null);
  const loanTypeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if ((target as Element).closest?.('.loan-filter-popup')) return;

      if (statusRef.current && !statusRef.current.contains(target)) setStatusFilterOpen(false);
      if (loanTypeRef.current && !loanTypeRef.current.contains(target)) setLoanTypeFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLocalStatus = (val: string) => {
    setLocalStatuses(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);
  };

  const toggleLocalLoanType = (val: string) => {
    setLocalLoanTypes(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);
  };

  const handleApplyStatus = () => {
    dispatch(setTableStatusFilters(localStatuses));
    setStatusFilterOpen(false);
  };

  const handleApplyLoanType = () => {
    dispatch(setTableTypeFilters(localLoanTypes));
    setLoanTypeFilterOpen(false);
  };

  const handleClearStatus = () => {
    setLocalStatuses([]);
    dispatch(setTableStatusFilters([]));
    setStatusFilterOpen(false);
  };

  const handleClearLoanType = () => {
    setLocalLoanTypes([]);
    dispatch(setTableTypeFilters([]));
    setLoanTypeFilterOpen(false);
  };

  const hasFilters = selectedStatuses.length > 0 || selectedLoanTypes.length > 0;

  const handleClearFilters = () => {
    dispatch(setTableStatusFilters([]));
    dispatch(setTableTypeFilters([]));
    setLocalStatuses([]);
    setLocalLoanTypes([]);
  };

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full border-collapse text-left text-base text-gray-500 whitespace-nowrap">
        <thead className="bg-[#fafafa] text-[13px] font-bold uppercase tracking-wider text-gray-400">
          <tr>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">Application ID</th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">PHONE NUMBER</th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">
              <div className="relative inline-flex items-center gap-1.5">
                STATUS
                <button
                  ref={statusRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilterOpen(!statusFilterOpen);
                  }}
                  className={`rounded p-0.5 transition hover:bg-slate-200 outline-none ${statusFilterOpen || selectedStatuses.length > 0 ? 'text-[#1E6865]' : 'text-[#AEB4BA]'}`}
                >
                  <Filter size={16} strokeWidth={2.5} />
                </button>
                {statusFilterOpen && (
                  <div className="loan-filter-popup absolute top-full left-0 mt-2 z-[99] flex min-w-[240px] w-max flex-col rounded-xl border border-gray-200 bg-white shadow-xl normal-case tracking-normal text-gray-900" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                      <Filter size={16} className="text-emerald-600" /> FILTER BY STATUS
                    </div>
                    <div className="flex flex-col max-h-[300px] overflow-y-auto font-medium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {statusOptions.map((opt, idx) => {
                        const isChecked = localStatuses.includes(opt);
                        return (
                          <button key={opt} type="button" onClick={() => toggleLocalStatus(opt)} className={`flex items-center gap-4 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-gray-50 text-[#4B5563] text-left ${idx !== statusOptions.length - 1 ? 'border-b border-[#F3F3F3]' : ''}`}>
                            <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border transition-all duration-200 ease-in-out rounded-sm ${isChecked ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-[#9CA3AF] bg-white'}`}>
                              <Check size={12} strokeWidth={3} className={`transition-all duration-200 ease-in-out rounded-sm  ${isChecked ? 'scale-100 opacity-100' : 'scale-50 opacity-0 rounded-sm'}`} />
                            </span>
                            <span className="flex-1 text-[15px] whitespace-normal">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 p-3 bg-gray-50/50 rounded-b-xl font-bold">
                      <button onClick={handleClearStatus} className="text-lg font-medium text-gray-500 hover:text-gray-600">Clear</button>
                      <button onClick={handleApplyStatus} className="rounded-lg bg-[#16A34A] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#10883c]">Apply</button>
                    </div>
                  </div>
                )}
              </div>
            </th>
            <th className="border-b border-gray-100 px-6 py-4 font-semibold">
              <div className="relative inline-flex items-center gap-1.5">
                LOAN TYPE
                <button
                  ref={loanTypeRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLoanTypeFilterOpen(!loanTypeFilterOpen);
                  }}
                  className={`rounded p-0.5 transition hover:bg-slate-200 outline-none ${loanTypeFilterOpen || selectedLoanTypes.length > 0 ? 'text-[#1E6865]' : 'text-[#AEB4BA]'}`}
                >
                  <Filter size={16} strokeWidth={2.5} />
                </button>
                {loanTypeFilterOpen && (
                  <div className="loan-filter-popup absolute top-full left-0 mt-2 z-[99] flex min-w-[240px] w-max flex-col rounded-xl border border-gray-200 bg-white shadow-xl normal-case tracking-normal text-gray-900" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                      <Filter size={16} className="text-emerald-600" /> FILTER BY LOAN TYPE
                    </div>
                    <div className="flex flex-col max-h-[300px] overflow-y-auto font-medium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {loanTypeOptions.map((opt, idx) => {
                        const isChecked = localLoanTypes.includes(opt);
                        return (
                          <button key={opt} type="button" onClick={() => toggleLocalLoanType(opt)} className={`flex items-center gap-4 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-gray-50 text-[#4B5563] text-left ${idx !== loanTypeOptions.length - 1 ? 'border-b border-[#F3F3F3]' : ''}`}>
                            <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border transition-all duration-200 ease-in-out rounded-sm ${isChecked ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-[#9CA3AF] bg-white'}`}>
                              <Check size={12} strokeWidth={3} className={`transition-all duration-200 ease-in-out rounded-sm  ${isChecked ? 'scale-100 opacity-100' : 'scale-50 opacity-0 rounded-sm'}`} />
                            </span>
                            <span className="flex-1 text-[15px] whitespace-normal">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 p-3 bg-gray-50/50 rounded-b-xl font-bold">
                      <button onClick={handleClearLoanType} className="text-base font-medium text-gray-500 hover:text-gray-600">Clear</button>
                      <button onClick={handleApplyLoanType} className="rounded-lg bg-[#16A34A] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#10883c]">Apply</button>
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
            <LoanEmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
          ) : (
            rows.map((row, i) => {
              let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
              let dotColor = "bg-gray-400";

              const statusLower = row.status.toLowerCase();
              if (statusLower.includes('processing') || statusLower.includes('active') || row.statusTone === 'info') {
                badgeColor = "bg-cyan-100 text-cyan-600 border border-cyan-300";
                dotColor = "bg-cyan-600";
              } else if (statusLower.includes('approved') || statusLower.includes('granted') || statusLower.includes('verified') || row.statusTone === 'success') {
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
                    <strong className="block text-base font-semibold text-[#16A34A]">{row.id}</strong>
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
                      {row.status.replace(/Verified|Approved/gi, 'Granted').replace(/Active/gi, 'Processing')}
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
