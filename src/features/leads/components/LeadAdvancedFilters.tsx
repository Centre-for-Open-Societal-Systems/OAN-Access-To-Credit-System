import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SlidersHorizontal, X, Check, Phone, Calendar, ChevronDown } from 'lucide-react';
import { KPI_CARDS_LAYOUT } from '../constants/leads.constants';
import { selectAdvFilters, setAdvFilters, resetFilters } from '../store/leadSlice';

interface LeadAdvancedFiltersProps {
  onClose: () => void;
}

function LeadAdvancedFilters({ onClose }: LeadAdvancedFiltersProps) {
  const dispatch = useAppDispatch();
  const activeFilters = useAppSelector(selectAdvFilters);

  const CALL_STATUS_OPTS = ['All', 'Completed', 'Missed', 'Voicemail'];
  const QUICK_DATE_OPTS = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];
  const CATEGORY_DOT_CFG: Record<string, string> = {
    initiated: 'bg-blue-500',
    qualified: 'bg-green-500',
    processed: 'bg-[#0D9488]',
    granted: 'bg-emerald-500',
    rejected: 'bg-orange-400',
    dormant: 'bg-red-400',
  };


  const RANGE_STEPS = [
    { label: '0-25,000', value: '0-25000', min: 0, max: 25000, display: 'ETB 0 - 25,000' },
    { label: '25,001 - 50,000', value: '25001-50000', min: 25001, max: 50000, display: 'ETB 25,001 - 50,000' },
    { label: '50,001 - 1,00,000', value: '50001-100000', min: 50001, max: 100000, display: 'ETB 50,001 - 1,00,000' },
    { label: '1,00,000 and above', value: '100000+', min: 100001, max: 10000000, display: 'ETB 1,00,000 and above' },
    { label: 'All Amounts', value: 'all', min: null, max: null, display: 'All Amounts' },
  ] as const;

  const LOAN_TYPE_OPTS = [
    'Input loan (seeds, agrochemicals)',
    'Agricultural term loan',
    'Smallholder short-term loan',
    'Land loan',
    'Farm equipment loan',
    'Smallholder farmer direct loan',
  ] as const;

  const LEAD_SOURCE_OPTS = [
    'Organic',
    'Call Campaign',
    'Special Harvest Campaign',
  ] as const;

  const [selStatuses, setSelStatuses] = useState<string[]>(activeFilters.statuses);
  const [callSt, setCallSt] = useState(activeFilters.callStatus);
  const [quickDate, setQuickDate] = useState(activeFilters.quickDate);
  const [dateFrom, setDateFrom] = useState(activeFilters.dateFrom);
  const [dateTo, setDateTo] = useState(activeFilters.dateTo);
  const [location, setLocation] = useState(activeFilters.location || '');

  const getInitialIndex = () => {
    const min = activeFilters.minAmount;
    const max = activeFilters.maxAmount;
    if (min === null || max === null) return 4;
    if (min === 0 && max === 25000) return 0;
    if (min === 25001 && max === 50000) return 1;
    if (min === 50001 && max === 100000) return 2;
    if (min === 100001 && max === 10000000) return 3;
    return 4;
  };

  // Loan Amount states
  const [isAmountOpen, setIsAmountOpen] = useState(false);
  const [tempIndex, setTempIndex] = useState<number>(getInitialIndex);
  const amountRef = useRef<HTMLDivElement>(null);

  // Loan Type states
  const [isLoanTypeOpen, setIsLoanTypeOpen] = useState(false);
  const [tempLoanType, setTempLoanType] = useState<string | null>(activeFilters.loanType);
  const loanTypeRef = useRef<HTMLDivElement>(null);

  // Lead Source states
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [tempSources, setTempSources] = useState<string[]>(activeFilters.leadSources || []);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (amountRef.current && !amountRef.current.contains(e.target as Node)) {
        setIsAmountOpen(false);
      }
    }
    if (isAmountOpen) document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [isAmountOpen]);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (loanTypeRef.current && !loanTypeRef.current.contains(e.target as Node)) {
        setIsLoanTypeOpen(false);
      }
    }
    if (isLoanTypeOpen) document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [isLoanTypeOpen]);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (sourcesRef.current && !sourcesRef.current.contains(e.target as Node)) {
        setIsSourcesOpen(false);
      }
    }
    if (isSourcesOpen) document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [isSourcesOpen]);

  const toggleStatus = (s: string) => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleSource = (s: string) => setTempSources(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const selectedAmountSummary = useMemo(() => {
    if (tempIndex === 4) return '';
    return RANGE_STEPS[tempIndex].display;
  }, [tempIndex]);

  const activeCount =
    (selStatuses.length > 0 ? 1 : 0) +
    (callSt !== 'All' ? 1 : 0) +
    (quickDate || dateFrom ? 1 : 0) +
    (location.trim() ? 1 : 0) +
    (tempIndex !== 4 ? 1 : 0) +
    (tempLoanType ? 1 : 0) +
    (tempSources.length > 0 ? 1 : 0);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[540px] flex-col bg-white shadow-2xl font-sans">

        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={20} className="text-text-primary" strokeWidth={2} />
            <h3 className="text-lg font-semibold text-text-primary">Advanced Filters</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-text-muted transition hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">

          {/* Status */}
          <section>
            <p className="mb-3 text-base font-semibold text-text-primary">Status</p>
            <div className="grid grid-cols-2 gap-2">
              {KPI_CARDS_LAYOUT.filter(item => item.id !== 'total').map(item => {
                const s = item.id;
                const label = item.label;
                const sel = selStatuses.includes(s);
                const dot = CATEGORY_DOT_CFG[s] ?? 'bg-slate-400';
                return (
                  <div
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 transition ${sel ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${sel ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'
                        }`}>
                        {sel && <Check size={12} strokeWidth={3} className="text-white" />}
                      </div>
                      <span className={`text-base font-medium ${sel ? 'text-green-700' : 'text-text-primary'}`}>{label}</span>
                    </div>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
                  </div>
                    );
              })}
                  </div>
          </section>

          {/* Call Status */}
          <section>
            <p className="mb-3 text-base font-semibold text-text-primary">Call Status</p>
            <div className="flex flex-wrap gap-2">
              {CALL_STATUS_OPTS.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setCallSt(o)}
                  className={`rounded-xl border px-5 py-2.5 text-base font-medium transition ${callSt === o
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text-primary'
                    }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </section>

          {/* Loan Amount */}
          <section ref={amountRef} className="relative">
                <p className="mb-3 text-base font-semibold text-text-primary">Loan Amount</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAmountOpen(prev => !prev)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${isAmountOpen
                      ? 'border-green-600 bg-white ring-2 ring-green-600/15'
                      : 'border-gray-200 bg-white hover:border-green-600/50'
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
                      style={{
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      {/* Slider Section */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold tracking-[0.5px] text-[#6D7C8F]">LIMIT RANGE</p>
                        <div className="relative w-full pt-6 pb-2">
                          <div
                            className="absolute -top-1.5 px-2 py-0.5 bg-[#DBFCE7] border border-[#BBE9CC] rounded text-[10px] font-bold text-[#16A34A] transition-all -translate-x-1/2 whitespace-nowrap animate-pulse-once"
                            style={{ left: `${Math.min(90, Math.max(10, (tempIndex / 4) * 100))}%` }}
                          >
                            {RANGE_STEPS[tempIndex].display}
                          </div>
                          <div className="h-2 w-full bg-[#CED3DA] rounded-full relative">
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
                              className="absolute w-5 h-5 bg-white border-[3px] border-[#4B8261] rounded-full -top-1.5 -ml-2.5 pointer-events-none transition-all"
                              style={{ left: `${(tempIndex / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr className="border-t border-[#F3F3F3] -mx-4" />

                      {/* Ranges Section */}
                      <div className="flex flex-col -mx-4 -mb-4">
                        {RANGE_STEPS.slice(0, 4).map((opt, idx) => {
                          const isSel = tempIndex === idx;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => {
                                if (isSel) {
                                  setTempIndex(4);
                                } else {
                                  setTempIndex(idx);
                                }
                              }}
                              className="flex items-center gap-3 py-3 px-4 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none"
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${isSel
                                ? 'border-green-600 bg-green-600'
                                : 'border-[#A6A9AF] bg-white'
                                }`}>
                                {isSel && <Check size={12} strokeWidth={3} className="text-white" />}
                              </div>
                              <span className="text-sm font-normal text-[#4B5563]">{opt.label}</span>
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
                <p className="mb-3 text-base font-semibold text-text-primary">Loan Type</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLoanTypeOpen(prev => !prev)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${isLoanTypeOpen
                      ? 'border-green-600 bg-white ring-2 ring-green-600/15'
                      : 'border-[#EDEFF1] bg-white hover:border-green-600/50'
                      }`}
                    style={{
                      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <span className={tempLoanType ? 'text-[#232F34] font-medium font-sans' : 'text-[#8E9AA0] font-sans'}>
                      {tempLoanType || 'Select Loan Type'}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLoanTypeOpen ? 'rotate-180 text-green-600' : ''}`} />
                  </button>

                  {isLoanTypeOpen && (
                    <div
                      className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col"
                      style={{
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div className="flex flex-col">
                        {LOAN_TYPE_OPTS.map((opt, idx) => {
                          const isSel = tempLoanType === opt;
                          return (
                            <div
                              key={opt}
                              onClick={() => {
                                if (isSel) {
                                  setTempLoanType(null);
                                } else {
                                  setTempLoanType(opt);
                                }
                              }}
                              className={`flex items-center gap-3 py-3 px-4 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${idx === 5 ? 'rounded-b-lg' : ''
                                }`}
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${isSel
                                ? 'border-green-600 bg-green-600'
                                : 'border-[#A6A9AF] bg-white'
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

              {/* Lead Source */}
              <section ref={sourcesRef} className="relative">
                <p className="mb-3 text-base font-semibold text-text-primary">Lead Source</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSourcesOpen(prev => !prev)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none ${isSourcesOpen
                      ? 'border-green-600 bg-white ring-2 ring-green-600/15'
                      : 'border-[#EDEFF1] bg-white hover:border-green-600/50'
                      }`}
                    style={{
                      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <span className="text-[#8E9AA0] font-sans">Select Lead Source</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isSourcesOpen ? 'rotate-180 text-green-600' : ''}`} />
                  </button>

                  {/* Active Source Chips */}
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

                  {/* Dropdown List */}
                  {isSourcesOpen && (
                    <div
                      className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col"
                      style={{
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div className="flex flex-col">
                        {LEAD_SOURCE_OPTS.map((opt, idx) => {
                          const isSel = tempSources.includes(opt);
                          return (
                            <div
                              key={opt}
                              onClick={() => toggleSource(opt)}
                              className={`flex items-center gap-3 py-3 px-4 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${idx === LEAD_SOURCE_OPTS.length - 1 ? 'rounded-b-lg' : ''
                                }`}
                            >
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${isSel
                                ? 'border-green-600 bg-green-600'
                                : 'border-[#A6A9AF] bg-white'
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

              {/* Location */}
              <section>
                <p className="mb-3 text-base font-semibold text-text-primary">Location</p>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Enter Region, Woreda or Kebele"
                    className="w-full rounded-xl border border-[#EDEFF1] bg-white py-3 px-4 text-sm text-[#232F34] placeholder:text-[#8E9AA0] focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 font-sans shadow-sm"
                  />
                </div>
              </section>

              {/* Date Range */}
              <section>
                <p className="mb-3 text-base font-semibold text-text-primary">Date Range</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'From', val: dateFrom, set: (v: string) => { setDateFrom(v); setQuickDate(''); } },
                    { label: 'To', val: dateTo, set: (v: string) => { setDateTo(v); setQuickDate(''); } },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <p className="mb-1 text-sm text-text-muted">{label}</p>
                      <div className="relative">
                        <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={val}
                          onChange={e => set(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-base text-text-primary focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK_DATE_OPTS.map(o => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => { setQuickDate(o); setDateFrom(''); setDateTo(''); }}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${quickDate === o
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text-primary'
                        }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* footer */}
            <div className="flex gap-3 border-t border-gray-300 px-5 py-6 bg-gray-100">
              <button
                type="button"
                onClick={() => {
                  dispatch(resetFilters());
                  setSelStatuses([]);
                  setCallSt('All');
                  setQuickDate('Last 30 Days');
                  setDateFrom('');
                  setDateTo('');
                  setLocation('');
                  setTempIndex(4);
                  setTempLoanType(null);
                  setTempSources([]);
                }}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-4 mb-3 text-base font-medium text-text-primary transition hover:bg-slate-50"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  const activeRange = RANGE_STEPS[tempIndex];
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
                  onClose();
                }}
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
}

        export default LeadAdvancedFilters;
