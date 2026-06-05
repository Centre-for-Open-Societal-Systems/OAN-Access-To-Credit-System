import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal, ChevronDown, Calendar, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AdvancedFilters, selectAdvancedFilters, setAdvancedFilters, clearAdvancedFilters } from '../store/loanDashboardSlice';
import { DatePickerField } from '@/components/ui/DatePickerField';

interface LoanAdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: 'Processing', value: 'Processing', dot: 'bg-teal-500' },
  { label: 'Approved', value: 'Approved', dot: 'bg-teal-500' },
  { label: 'Rejected', value: 'Rejected', dot: 'bg-red-500' },
];

const QUICK_DATE_OPTS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
];

const RANGE_STEPS = [
  { label: '0-25,000', value: '0-25000', display: 'ETB 0 - 25,000' },
  { label: '25,001 - 50,000', value: '25001-50000', display: 'ETB 25,001 - 50,000' },
  { label: '50,001 - 1,00,000', value: '50001-100000', display: 'ETB 50,001 - 1,00,000' },
  { label: '1,00,000 and above', value: '100000+', display: 'ETB 100,000+' },
  { label: 'All Amounts', value: '', display: 'All Amounts' },
] as const;

const LOAN_TYPE_OPTS = [
  'Input loan (seeds, agrochemicals)',
  'Agricultural term loan',
  'Smallholder short-term loan',
  'Land loan',
  'Farm equipment loan',
  'Smallholder farmer direct loan'
];

export default function LoanAdvancedFilters({ isOpen, onClose }: LoanAdvancedFiltersProps) {
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector(selectAdvancedFilters);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [selStatuses, setSelStatuses] = useState<string[]>(currentFilters.status);
  const [tempIndex, setTempIndex] = useState<number>(4); // 4 = All Amounts
  const [tempLoanTypes, setTempLoanTypes] = useState<string[]>(currentFilters.type || []);
  const [location, setLocation] = useState(currentFilters.location || '');
  const [dateFrom, setDateFrom] = useState(currentFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(currentFilters.dateTo || '');
  const [quickDate, setQuickDate] = useState('');

  // Dropdown states
  const [isAmountOpen, setIsAmountOpen] = useState(false);
  const amountRef = useRef<HTMLDivElement>(null);

  const [isLoanTypeOpen, setIsLoanTypeOpen] = useState(false);
  const loanTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setSelStatuses(currentFilters.status);
      setLocation(currentFilters.location);
      setDateFrom(currentFilters.dateFrom);
      setDateTo(currentFilters.dateTo);
      setTempLoanTypes(currentFilters.type || []);

      const amtIdx = RANGE_STEPS.findIndex(r => r.value === currentFilters.amountRange);
      setTempIndex(amtIdx >= 0 ? amtIdx : 4);

      if (!currentFilters.dateFrom && !currentFilters.dateTo) {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        setDateFrom(todayStr);
        setDateTo(todayStr);
        setQuickDate('Today');
      } else {
        setQuickDate('');
      }
    }
  }, [isOpen, currentFilters]);

  // Click outside handlers
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (amountRef.current && !amountRef.current.contains(e.target as Node)) setIsAmountOpen(false);
      if (loanTypeRef.current && !loanTypeRef.current.contains(e.target as Node)) setIsLoanTypeOpen(false);
    }
    if (isAmountOpen || isLoanTypeOpen) document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [isAmountOpen, isLoanTypeOpen]);

  const selectedAmountSummary = useMemo(() => {
    if (tempIndex === 4) return '';
    return RANGE_STEPS[tempIndex].display;
  }, [tempIndex]);

  if (!mounted || !isOpen) return null;

  const toggleStatus = (s: string) => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleApply = () => {
    dispatch(setAdvancedFilters({
      status: selStatuses,
      amountRange: RANGE_STEPS[tempIndex].value,
      type: tempLoanTypes,
      location,
      dateFrom,
      dateTo,
    }));
    onClose();
  };

  const handleReset = () => {
    setSelStatuses([]);
    setTempIndex(4);
    setTempLoanTypes([]);
    setLocation('');
    setDateFrom('');
    setDateTo('');
    setQuickDate('');
  };

  const activeCount =
    selStatuses.length +
    (tempIndex !== 3 ? 1 : 0) +
    (tempLoanTypes.length > 0 ? 1 : 0) +
    (location ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  const sidebarContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end font-sans">
      <div
        className="absolute inset-0 bg-black/25 transition-opacity"
        onClick={onClose}
      />

      <aside className="relative w-full max-w-[540px] bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 ">
          <div className="flex items-center gap-2.5 ">
            <SlidersHorizontal size={20} className="text-[#232F34]" strokeWidth={2} />
            <h3 className="text-lg font-semibold text-[#232F34]">Advanced Filters</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">

          {/* Status */}
          <section>
            <p className="mb-3 text-base font-semibold text-[#232F34]">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(opt => {
                const sel = selStatuses.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleStatus(opt.value)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 transition ${sel ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${sel ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}`}>
                        {sel && <Check size={12} strokeWidth={3} className="text-white" />}
                      </div>
                      <span className={`text-base font-medium ${sel ? 'text-green-700' : 'text-[#232F34]'}`}>{opt.label}</span>
                    </div>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${opt.dot}`} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Loan Amount */}
          <section ref={amountRef} className="relative">
            <p className="mb-3 text-base font-semibold text-[#232F34]">Loan Amount</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAmountOpen(prev => !prev)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${isAmountOpen ? 'border-green-600 bg-white ring-2 ring-green-600/15' : 'border-gray-200 bg-white hover:border-green-600/50'}`}
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
                        <span className="text-sm font-bold text-gray-700">1000000</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-[#F3F3F3] -mx-4" />

                  <div className="flex flex-col -mx-4 -mb-4">
                    {RANGE_STEPS.slice(0, 4).map((opt, idx) => {
                      const isSel = tempIndex === idx;
                      return (
                        <div
                          key={opt.value}
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
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${isLoanTypeOpen ? 'border-green-600 bg-white ring-2 ring-green-600/15' : 'border-[#EDEFF1] bg-white hover:border-green-600/50'}`}
              >
                <span className={tempLoanTypes.length > 0 ? 'text-[#232F34] font-medium' : 'text-[#8E9AA0]'}>
                  {tempLoanTypes.length > 0 ? `${tempLoanTypes.length} Selected` : 'Select Loan Type'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLoanTypeOpen ? 'rotate-180 text-green-600' : ''}`} />
              </button>

              {isLoanTypeOpen && (
                <div className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col">
                  <div className="flex flex-col">
                    {LOAN_TYPE_OPTS.map((opt, idx) => {
                      const isSel = tempLoanTypes.includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => setTempLoanTypes(prev => isSel ? prev.filter(x => x !== opt) : [...prev, opt])}
                          className={`flex items-center gap-4 py-4 px-6 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${idx === LOAN_TYPE_OPTS.length - 1 ? 'rounded-b-lg' : ''}`}
                        >
                          <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all ${isSel ? 'border-[#16A34A] bg-[#16A34A]' : 'border-gray-400 bg-white'}`}>
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

          {/* Location */}
          <section>
            <p className="mb-3 text-base font-semibold text-[#232F34]">Location</p>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter Region, Woreda or Kebele"
                className="w-full rounded-md border border-[#EDEFF1] bg-white py-3 px-4 text-sm text-[#232F34] placeholder:text-[#8E9AA0] focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm"
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
                  <DatePickerField
                    value={val}
                    onChange={(v) => set(v)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_DATE_OPTS.map(o => (
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
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${quickDate === o.label ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                >
                  {o.label}
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
    </div>
  );

  return createPortal(sidebarContent, document.body);
}
