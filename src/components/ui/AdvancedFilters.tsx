'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SlidersHorizontal, X, Check, Calendar, ChevronDown } from 'lucide-react';
import { KPI_CARDS_LAYOUT } from '@/features/leads/constants/leads.constants';
import { selectAdvFilters, setAdvFilters, resetFilters } from '@/features/leads/store/leadSlice';
import { selectNewLeadState, fetchLeadMetadataThunk } from '@/features/new-lead/store/newLeadSlice';
import { selectAdvancedFilters, setAdvancedFilters, clearAdvancedFilters } from '@/features/loans/store/loanDashboardSlice';
import { DatePickerField } from './DatePickerField';

interface AdvancedFiltersProps {
  onClose: () => void;
  isOpen?: boolean; // optional, defaults to true
  mode?: 'leads' | 'loans'; // defaults to 'leads'
}

const CATEGORY_DOT_CFG: Record<string, string> = {
  initiated: 'bg-blue-500',
  qualified: 'bg-green-500',
  processed: 'bg-[#0D9488]',
  granted: 'bg-emerald-500',
  rejected: 'bg-orange-400',
  dormant: 'bg-red-400',
};

const RANGE_STEPS = [
  { label: '0-25,000', min: 0, max: 25000, display: 'ETB 0 - 25,000' },
  { label: '25,001 - 50,000', min: 25001, max: 50000, display: 'ETB 25,001 - 50,000' },
  { label: '50,001 - 1,00,000', min: 50001, max: 100000, display: 'ETB 50,001 - 1,00,000' },
  { label: '1,00,000 and above', min: 100001, max: 10000000, display: 'ETB 100,000+' },
  { label: 'All Amounts', min: null, max: null, display: 'All Amounts' },
] as const;

const LOAN_STATUS_DOT_CFG: Record<string, string> = {
  Processing: 'bg-teal-500',
  Approved: 'bg-teal-500',
  Rejected: 'bg-red-500',
};

const LEADS_QUICK_DATE_OPTS = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];
const LOANS_QUICK_DATE_OPTS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
];

function AdvancedFilters({ onClose, isOpen = true, mode = 'leads' }: AdvancedFiltersProps) {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  // Redux filters
  const leadsFilters = useAppSelector(selectAdvFilters);
  const loansFilters = useAppSelector(selectAdvancedFilters);

  // Dynamic Metadata Options
  const { leadSourcesOptions, loanTypesOptions } = useAppSelector(selectNewLeadState);
  const dynamicLoanTypes = loanTypesOptions || [];
  const dynamicLeadSources = leadSourcesOptions || [];

  // Local state fields
  const [selStatuses, setSelStatuses] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [tempIndex, setTempIndex] = useState<number>(4); // default 4 (All Amounts)

  // Leads-specific local state
  const [callSt, setCallSt] = useState('All');
  const [tempSources, setTempSources] = useState<string[]>([]);
  const [tempLoanType, setTempLoanType] = useState<string | null>(null);

  // Loans-specific local state
  const [tempLoanTypes, setTempLoanTypes] = useState<string[]>([]);

  // Dropdown UI states
  const [isAmountOpen, setIsAmountOpen] = useState(false);
  const amountRef = useRef<HTMLDivElement>(null);

  const [isLoanTypeOpen, setIsLoanTypeOpen] = useState(false);
  const loanTypeRef = useRef<HTMLDivElement>(null);

  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch metadata options if empty on mount/open
  useEffect(() => {
    if (isOpen) {
      if (loanTypesOptions.length === 0 || leadSourcesOptions.length === 0) {
        dispatch(fetchLeadMetadataThunk());
      }
    }
  }, [dispatch, isOpen, loanTypesOptions.length, leadSourcesOptions.length]);

  // Sync state from Redux when drawer is opened or mode/filters change
  useEffect(() => {
    if (isOpen) {
      if (mode === 'loans') {
        setSelStatuses(loansFilters.status || []);
        setLocation(loansFilters.location || '');
        setDateFrom(loansFilters.dateFrom || '');
        setDateTo(loansFilters.dateTo || '');
        setTempLoanTypes(loansFilters.type || []);

        const min = loansFilters.minLoan;
        const max = loansFilters.maxLoan;
        let amtIdx = 4;
        if (min !== null && max !== null) {
          if (min === 0 && max === 25000) amtIdx = 0;
          else if (min === 25001 && max === 50000) amtIdx = 1;
          else if (min === 50001 && max === 100000) amtIdx = 2;
          else if (min === 100001 && max === 10000000) amtIdx = 3;
        }
        setTempIndex(amtIdx);
        setQuickDate('');
      } else {
        setSelStatuses(leadsFilters.statuses || []);
        setLocation(leadsFilters.location || '');
        setDateFrom(leadsFilters.dateFrom || '');
        setDateTo(leadsFilters.dateTo || '');
        setQuickDate(leadsFilters.quickDate || '');
        setCallSt(leadsFilters.callStatus || 'All');
        setTempSources(leadsFilters.leadSources || []);
        setTempLoanType(leadsFilters.loanType);

        const min = leadsFilters.minAmount;
        const max = leadsFilters.maxAmount;
        let amtIdx = 4;
        if (min !== null && max !== null) {
          if (min === 0 && max === 25000) amtIdx = 0;
          else if (min === 25001 && max === 50000) amtIdx = 1;
          else if (min === 50001 && max === 100000) amtIdx = 2;
          else if (min === 100001 && max === 10000000) amtIdx = 3;
        }
        setTempIndex(amtIdx);
      }
    }
  }, [isOpen, mode, leadsFilters, loansFilters]);

  // Click outside handlers
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (amountRef.current && !amountRef.current.contains(e.target as Node)) {
        setIsAmountOpen(false);
      }
      if (loanTypeRef.current && !loanTypeRef.current.contains(e.target as Node)) {
        setIsLoanTypeOpen(false);
      }
      if (sourcesRef.current && !sourcesRef.current.contains(e.target as Node)) {
        setIsSourcesOpen(false);
      }
    }
    if (isAmountOpen || isLoanTypeOpen || isSourcesOpen) {
      document.addEventListener('mousedown', clickOutside);
    }
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [isAmountOpen, isLoanTypeOpen, isSourcesOpen]);

  const toggleStatus = (s: string) => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleSource = (s: string) => setTempSources(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const selectedAmountSummary = useMemo(() => {
    if (tempIndex === 4) return '';
    return RANGE_STEPS[tempIndex].display;
  }, [tempIndex]);

  // Calculate active filter counts
  const activeCount = useMemo(() => {
    if (mode === 'loans') {
      return (
        selStatuses.length +
        (tempIndex !== 4 ? 1 : 0) +
        (tempLoanTypes.length > 0 ? 1 : 0) +
        (location ? 1 : 0) +
        (dateFrom || dateTo ? 1 : 0)
      );
    } else {
      return (
        (selStatuses.length > 0 ? 1 : 0) +
        (callSt !== 'All' ? 1 : 0) +
        (quickDate || dateFrom || dateTo ? 1 : 0) +
        (location.trim() ? 1 : 0) +
        (tempIndex !== 4 ? 1 : 0) +
        (tempLoanType ? 1 : 0) +
        (tempSources.length > 0 ? 1 : 0)
      );
    }
  }, [mode, selStatuses, tempIndex, tempLoanTypes, location, dateFrom, dateTo, callSt, quickDate, tempLoanType, tempSources]);

  const handleApply = () => {
    const activeRange = RANGE_STEPS[tempIndex];
    if (mode === 'loans') {
      dispatch(setAdvancedFilters({
        status: selStatuses,
        minLoan: activeRange.min,
        maxLoan: activeRange.max,
        type: tempLoanTypes,
        location,
        dateFrom,
        dateTo,
      }));
    } else {
      dispatch(setAdvFilters({
        statuses: selStatuses,
        callStatus: callSt,
        quickDate,
        dateFrom,
        dateTo,
        location,
        minAmount: activeRange.min,
        maxAmount: activeRange.max,
        loanType: tempLoanType,
        leadSources: tempSources,
      }));
    }
    onClose();
  };

  const handleReset = () => {
    if (mode === 'loans') {
      dispatch(clearAdvancedFilters());
      setSelStatuses([]);
      setTempIndex(4);
      setTempLoanTypes([]);
      setLocation('');
      setDateFrom('');
      setDateTo('');
      setQuickDate('');
    } else {
      dispatch(resetFilters());
      setSelStatuses([]);
      setCallSt('All');
      setQuickDate('');
      setDateFrom('');
      setDateTo('');
      setLocation('');
      setTempIndex(4);
      setTempLoanType(null);
      setTempSources([]);
    }
  };

  if (!mounted || !isOpen) return null;

  const statusesToMap = mode === 'loans'
    ? Object.keys(LOAN_STATUS_DOT_CFG).map(status => ({
        id: status,
        label: status,
        dot: LOAN_STATUS_DOT_CFG[status]
      }))
    : KPI_CARDS_LAYOUT.filter(item => item.id !== 'total').map(item => ({
        id: item.id,
        label: item.label,
        dot: CATEGORY_DOT_CFG[item.id] ?? 'bg-slate-400'
      }));

  const sidebarContent = (
    <>
      <div className="fixed inset-0 z-40 bg-black/25 transition-opacity" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[540px] flex-col bg-white shadow-2xl font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={20} className="text-[#232F34]" strokeWidth={2} />
            <h3 className="text-lg font-semibold text-[#232F34]">Advanced Filters</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          
          {/* Status */}
          <section>
            <p className="mb-3 text-base font-semibold text-[#232F34]">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {statusesToMap.map(item => {
                const s = item.id;
                const label = item.label;
                const sel = selStatuses.includes(s);
                return (
                  <div
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 transition ${
                      sel ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                        sel ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'
                      }`}>
                        {sel && <Check size={12} strokeWidth={3} className="text-white" />}
                      </div>
                      <span className={`text-base font-medium ${sel ? 'text-green-700' : 'text-[#232F34]'}`}>{label}</span>
                    </div>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Call Status (Leads Only) */}
          {mode === 'leads' && (
            <section>
              <p className="mb-3 text-base font-semibold text-[#232F34]">Call Status</p>
              <div className="flex flex-wrap gap-2">
                {['All', 'Completed', 'Missed', 'Voicemail'].map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setCallSt(o)}
                    className={`rounded-xl border px-5 py-2.5 text-base font-medium transition ${
                      callSt === o
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-text-primary'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Loan Amount */}
          <section ref={amountRef} className="relative">
            <p className="mb-3 text-base font-semibold text-[#232F34]">Loan Amount</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAmountOpen(prev => !prev)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${
                  isAmountOpen ? 'border-green-600 bg-white ring-2 ring-green-600/15' : 'border-gray-200 bg-white hover:border-green-600/50'
                }`}
              >
                <span className={selectedAmountSummary ? 'text-[#232F34] font-medium' : 'text-[#8E9AA0]'}>
                  {selectedAmountSummary || 'Select Loan Amount'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isAmountOpen ? 'rotate-180 text-green-600' : ''}`} />
              </button>

              {isAmountOpen && (
                <div
                  className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col p-4 gap-4"
                  style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)' }}
                >
                  <div className="flex flex-col gap-6 px-2 pt-4 pb-2">
                    {/* Slider UI */}
                    <div className="relative w-full">
                      <div className="h-3 w-full bg-[#D1D5DB] rounded-full relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-[#16A34A] rounded-full"
                          style={{ width: `${(tempIndex / 4) * 100}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="4"
                          step="1"
                          value={tempIndex}
                          onChange={e => setTempIndex(Number(e.target.value))}
                          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                          className="absolute w-7 h-7 bg-white border-[4px] border-[#4B8261] rounded-full -top-2 -ml-3.5 pointer-events-none transition-all shadow-sm"
                          style={{ left: `${(tempIndex / 4) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Labels and Pill */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wide">ETB</span>
                        <span className="text-sm font-bold text-gray-700">0</span>
                      </div>

                      <div className="absolute left-1/2 -translate-x-1/2 bg-[#D1FAE5] border border-[#A7F3D0] px-3 py-1.5 rounded-lg flex items-center justify-center min-w-[120px]">
                        <span className="text-[13px] font-bold text-[#059669]">
                          {RANGE_STEPS[tempIndex].display}
                        </span>
                      </div>

                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wide">ETB</span>
                        <span className="text-sm font-bold text-gray-700">10,000,000</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-[#F3F3F3] -mx-4" />

                  <div className="flex flex-col -mx-4 -mb-4">
                    {RANGE_STEPS.slice(0, 4).map((opt, idx) => {
                      const isSel = tempIndex === idx;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => setTempIndex(isSel ? 4 : idx)}
                          className="flex items-center gap-4 py-4 px-6 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none"
                        >
                          <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all ${isSel ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-400 bg-white'}`}>
                            {isSel && <Check size={14} strokeWidth={4} className="text-white" />}
                          </div>
                          <span className="text-[15px] font-medium text-[#4B5563] tracking-wide">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Loan Type */}
          <section ref={loanTypeRef} className="relative">
            <p className="mb-3 text-base font-semibold text-[#232F34]">Loan Type</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLoanTypeOpen(prev => !prev)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${
                  isLoanTypeOpen ? 'border-green-600 bg-white ring-2 ring-green-600/15' : 'border-gray-200 bg-white hover:border-green-600/50'
                }`}
                style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
              >
                <span className={(mode === 'loans' ? tempLoanTypes.length > 0 : tempLoanType) ? 'text-[#232F34] font-medium' : 'text-[#8E9AA0]'}>
                  {mode === 'loans'
                    ? (tempLoanTypes.length > 0 ? `${tempLoanTypes.length} Selected` : 'Select Loan Type')
                    : (tempLoanType || 'Select Loan Type')}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLoanTypeOpen ? 'rotate-180 text-green-600' : ''}`} />
              </button>

              {isLoanTypeOpen && (
                <div
                  className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col"
                  style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)' }}
                >
                  <div className="flex flex-col max-h-60 overflow-y-auto">
                    {dynamicLoanTypes.map((opt, idx) => {
                      const isSel = mode === 'loans' ? tempLoanTypes.includes(opt) : tempLoanType === opt;
                      return (
                        <div
                          key={opt}
                          onClick={() => {
                            if (mode === 'loans') {
                              setTempLoanTypes(prev => isSel ? prev.filter(x => x !== opt) : [...prev, opt]);
                            } else {
                              setTempLoanType(isSel ? null : opt);
                            }
                          }}
                          className={`flex items-center gap-4 py-4 px-6 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${
                            idx === dynamicLoanTypes.length - 1 ? 'rounded-b-lg' : ''
                          }`}
                        >
                          <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            isSel ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-400 bg-white'
                          }`}>
                            {isSel && <Check size={14} strokeWidth={4} className="text-white" />}
                          </div>
                          <span className="text-[15px] font-medium text-[#4B5563] tracking-wide">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Lead Source (Leads Only) */}
          {mode === 'leads' && (
            <section ref={sourcesRef} className="relative">
              <p className="mb-3 text-base font-semibold text-[#232F34]">Lead Source</p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSourcesOpen(prev => !prev)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${
                    isSourcesOpen ? 'border-green-600 bg-white ring-2 ring-green-600/15' : 'border-gray-200 bg-white hover:border-green-600/50'
                  }`}
                  style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
                >
                  <span className="text-[#8E9AA0] font-sans">Select Lead Source</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isSourcesOpen ? 'rotate-180 text-green-600' : ''}`} />
                </button>

                {tempSources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tempSources.map(s => (
                      <div
                        key={s}
                        className="flex items-center gap-1.5 rounded-full border border-[#EDEFF1] bg-[#F1F3F4] px-3 py-1.5"
                      >
                        <span className="text-xs font-medium text-[#3A474E] font-sans">{s}</span>
                        <button
                          type="button"
                          onClick={() => toggleSource(s)}
                          className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isSourcesOpen && (
                  <div
                    className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col"
                    style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)' }}
                  >
                    <div className="flex flex-col max-h-60 overflow-y-auto">
                      {dynamicLeadSources.map((opt, idx) => {
                        const isSel = tempSources.includes(opt);
                        return (
                          <div
                            key={opt}
                            onClick={() => toggleSource(opt)}
                            className={`flex items-center gap-3 py-3 px-4 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${
                              idx === dynamicLeadSources.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                              isSel ? 'border-green-600 bg-green-600' : 'border-[#A6A9AF] bg-white'
                            }`}>
                              {isSel && <Check size={12} strokeWidth={3} className="text-white" />}
                            </div>
                            <span className="text-sm font-normal text-[#4B5563] font-sans">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Location */}
          <section>
            <p className="mb-3 text-base font-semibold text-[#232F34]">Location</p>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter Region, Woreda or Kebele"
                className="w-full rounded-md border border-[#EDEFF1] bg-white py-3 px-4 text-sm text-[#232F34] placeholder:text-[#8E9AA0] focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 font-sans shadow-sm"
              />
            </div>
          </section>

          {/* Date Range */}
          <section>
            <p className="mb-3 text-base font-semibold text-[#232F34]">Date Range</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'From', val: dateFrom, set: (v: string) => { setDateFrom(v); setQuickDate(''); } },
                { label: 'To', val: dateTo, set: (v: string) => { setDateTo(v); setQuickDate(''); } },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p className="mb-1 text-sm text-gray-500">{label}</p>
                  {mode === 'loans' ? (
                    <DatePickerField
                      value={val}
                      onChange={(v) => set(v)}
                    />
                  ) : (
                    <div className="relative">
                      <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={val}
                        onChange={e => set(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-base text-[#232F34] focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {mode === 'loans'
                ? LOANS_QUICK_DATE_OPTS.map(o => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => {
                        setQuickDate(o.label);
                        const to = new Date();
                        const from = new Date();
                        if (o.days === 1) {
                          from.setDate(from.getDate() - 1);
                          to.setDate(to.getDate() - 1);
                        } else {
                          from.setDate(from.getDate() - o.days);
                        }
                        setDateFrom(from.toISOString().split('T')[0]);
                        setDateTo(to.toISOString().split('T')[0]);
                      }}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                        quickDate === o.label
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))
                : LEADS_QUICK_DATE_OPTS.map(o => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => {
                        setQuickDate(o);
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        quickDate === o
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-text-primary'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-300 px-5 py-6 bg-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-4 mb-3 text-base font-medium text-[#232F34] transition hover:bg-slate-50"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] mb-3 py-3 text-sm font-semibold text-white transition hover:bg-[#10883c]"
          >
            Apply Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
                {activeCount}
              </span>
            )}
          </button>
        </div>

      </aside>
    </>
  );

  return createPortal(sidebarContent, document.body);
}

export default AdvancedFilters;
