import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SlidersHorizontal, X, Check, Phone, Calendar, ChevronDown } from 'lucide-react';
import { KPI_CARDS_LAYOUT, STATUS_STYLE_MAP } from '../constants/leads.constants';
import { selectAdvFilters, setAdvFilters, resetFilters } from '../store/leadSlice';
import { selectNewLeadState } from '@/features/new-lead/store/newLeadSlice';
import { DatePickerField } from '@/components/ui/DatePickerField';

interface LeadAdvancedFiltersProps {
  onClose: () => void;
}

function LeadAdvancedFilters({ onClose }: LeadAdvancedFiltersProps) {
  const dispatch = useAppDispatch();
  const activeFilters = useAppSelector(selectAdvFilters);
  const { leadSourcesOptions, loanTypesOptions } = useAppSelector(selectNewLeadState);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const QUICK_DATE_OPTS = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
  ];



  const RANGE_STEPS = [
    { label: '0-25,000', value: '0-25000', min: 0, max: 25000, display: 'ETB 0 - 25,000' },
    { label: '25,001 - 50,000', value: '25001-50000', min: 25001, max: 50000, display: 'ETB 25,001 - 50,000' },
    { label: '50,001 - 1,00,000', value: '50001-100000', min: 50001, max: 100000, display: 'ETB 50,001 - 1,00,000' },
    { label: '1,00,000 and above', value: '100000+', min: 100001, max: 10000000, display: 'ETB 1,00,000 and above' },
    { label: 'All Amounts', value: 'all', min: null, max: null, display: 'All Amounts' },
  ] as const;



  const LOCATION_OPTS = ['Region', 'Woreda', 'Kebele'] as const;

  const [selStatuses, setSelStatuses] = useState<string[]>(() =>
    activeFilters.statuses.map(s => {
      const match = KPI_CARDS_LAYOUT.find(item => item.id.toLowerCase() === s.toLowerCase() || item.label.toLowerCase() === s.toLowerCase());
      return match ? match.label : s;
    })
  );
  const [quickDate, setQuickDate] = useState(activeFilters.quickDate);
  const [dateFrom, setDateFrom] = useState(activeFilters.dateFrom);
  const [dateTo, setDateTo] = useState(activeFilters.dateTo);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!activeFilters.dateFrom && !activeFilters.dateTo) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setDateFrom(todayStr);
      setDateTo(todayStr);
      setQuickDate('Today');
    }
  }, [activeFilters.dateFrom, activeFilters.dateTo]);

  // Location states
  const [location, setLocation] = useState(activeFilters.location || '');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

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
  const [tempLoanTypes, setTempLoanTypes] = useState<string[]>(activeFilters.loanType || []);
  const loanTypeRef = useRef<HTMLDivElement>(null);

  // Lead Source states
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [tempSources, setTempSources] = useState<string[]>(activeFilters.leadSources || []);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelStatuses(activeFilters.statuses.map(s => {
      const match = KPI_CARDS_LAYOUT.find(item => item.id.toLowerCase() === s.toLowerCase() || item.label.toLowerCase() === s.toLowerCase());
      return match ? match.label : s;
    }));
    setQuickDate(activeFilters.quickDate);
    setDateFrom(activeFilters.dateFrom);
    setDateTo(activeFilters.dateTo);
    setLocation(activeFilters.location || '');
    setTempIndex(getInitialIndex());
    setTempLoanTypes(activeFilters.loanType || []);
    setTempSources(activeFilters.leadSources || []);
  }, [activeFilters]);

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

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    if (isLocationOpen) document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [isLocationOpen]);

  const toggleStatus = (s: string) => {
    const layoutItem = KPI_CARDS_LAYOUT.find(item => item.id === s);
    const label = layoutItem ? layoutItem.label : s;
    setSelStatuses(p => p.includes(label) ? p.filter(x => x !== label) : [...p, label]);
  };
  const toggleSource = (s: string) => setTempSources(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const selectedAmountSummary = useMemo(() => {
    if (tempIndex === 4) return '';
    return RANGE_STEPS[tempIndex].display;
  }, [tempIndex]);

  const activeCount =
    (selStatuses.length > 0 ? 1 : 0) +
    (quickDate || dateFrom ? 1 : 0) +
    (location.trim() ? 1 : 0) +
    (tempIndex !== 4 ? 1 : 0) +
    (tempLoanTypes.length > 0 ? 1 : 0) +
    (tempSources.length > 0 ? 1 : 0);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998] bg-black/25" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[9999] flex h-full w-[540px] flex-col bg-white shadow-2xl font-sans">

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
                const sel = selStatuses.includes(label);
                const dot = STATUS_STYLE_MAP[label]?.dotClass ?? 'bg-slate-400';
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
                <span className={tempLoanTypes.length > 0 ? 'text-[#232F34] font-medium font-sans' : 'text-[#8E9AA0] font-sans'}>
                  {tempLoanTypes.length > 0 ? `${tempLoanTypes.length} Selected` : 'Select Loan Type'}
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
                    {loanTypesOptions.map((opt, idx) => {
                      const isSel = tempLoanTypes.includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => setTempLoanTypes(prev => isSel ? prev.filter(x => x !== opt) : [...prev, opt])}
                          className={`flex items-center gap-4 py-4 px-6 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${idx === loanTypesOptions.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                        >
                          <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all ${isSel
                            ? 'border-[#16A34A] bg-[#16A34A]'
                            : 'border-gray-400 bg-white'
                            }`}>
                            {isSel && <Check size={14} strokeWidth={4} className="text-white" />}
                          </div>
                          <span className="text-[15px] font-medium text-[#4B5563] tracking-wide font-sans">{opt}</span>
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
                <span className={tempSources.length > 0 ? 'text-[#232F34] font-medium font-sans' : 'text-[#8E9AA0] font-sans'}>
                  {tempSources.length > 0 ? `${tempSources.length} Selected` : 'Select Lead Source'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isSourcesOpen ? 'rotate-180 text-green-600' : ''}`} />
              </button>

              {/* Dropdown List */}
              {isSourcesOpen && (
                <div
                  className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col"
                  style={{
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="flex flex-col">
                    {leadSourcesOptions.map((opt, idx) => {
                      const isSel = tempSources.includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => toggleSource(opt)}
                          className={`flex items-center gap-4 py-4 px-6 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${idx === leadSourcesOptions.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                        >
                          <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all ${isSel
                            ? 'border-[#16A34A] bg-[#16A34A]'
                            : 'border-gray-400 bg-white'
                            }`}>
                            {isSel && <Check size={14} strokeWidth={4} className="text-white" />}
                          </div>
                          <span className="text-[15px] font-medium text-[#4B5563] tracking-wide font-sans">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Location */}
          <section ref={locationRef} className="relative">
            <p className="mb-3 text-base font-semibold text-text-primary">Location</p>
            <div className="relative">
              <input
                type="text"
                value={location}
                onFocus={() => setIsLocationOpen(true)}
                onChange={e => {
                  setLocation(e.target.value);
                  setIsLocationOpen(true);
                }}
                placeholder="Enter Region, Woreda or Kebele"
                className="w-full rounded-xl border border-[#EDEFF1] bg-white py-3 px-4 text-sm text-[#232F34] placeholder:text-[#8E9AA0] focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 font-sans shadow-sm"
              />
              {isLocationOpen && (
                <div
                  className="absolute left-0 right-0 z-30 mt-1 rounded-b-lg border border-gray-200 bg-white shadow-xl flex flex-col"
                  style={{
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.07), 0px 1px 2px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="flex flex-col">
                    {LOCATION_OPTS.filter(opt => opt.toLowerCase().includes(location.toLowerCase())).map((opt, idx) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setLocation(opt);
                          setIsLocationOpen(false);
                        }}
                        className={`py-3 px-4 border-b border-[#F3F3F3] last:border-0 hover:bg-slate-50 cursor-pointer select-none ${idx === LOCATION_OPTS.length - 1 ? 'rounded-b-lg' : ''}`}
                      >
                        <span className="text-[15px] text-[#4B5563] font-sans">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Date Range */}
          <section className={isDatePickerOpen ? "pb-[280px]" : ""}>
            <p className="mb-3 text-base font-semibold text-[#232F34]">Date Range</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'From', val: dateFrom, set: (v: string) => { setDateFrom(v); setQuickDate(''); } },
                { label: 'To', val: dateTo, set: (v: string) => { setDateTo(v); setQuickDate(''); } },
              ].map(({ label, val, set }) => (
                <div key={label} className="relative">
                  <p className="mb-1 text-sm text-gray-500">{label}</p>
                  <DatePickerField
                    value={val}
                    onChange={(v) => set(v)}
                    usePortal={false}
                    align={label === 'To' ? 'right' : 'left'}
                    onOpenChange={(isOpen) => setIsDatePickerOpen(isOpen)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 font-semibold">
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
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${quickDate === o.label ? 'border-green-600 bg-green-50 text-green-700 font-semibold' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 font-semibold'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* footer */}
        <div className="flex gap-3 border-t border-gray-300 px-5 py-6 bg-gray-100 font-bold font-semibold">
          <button
            type="button"
            onClick={() => {
              dispatch(resetFilters());
              setSelStatuses([]);

              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
              setDateFrom(todayStr);
              setDateTo(todayStr);
              setQuickDate('Today');

              setLocation('');
              setTempIndex(4);
              setTempLoanTypes([]);
              setTempSources([]);
            }}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-4 mb-3 text-base font-semibold text-[#232F34] transition hover:bg-slate-50"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={() => {
              const activeRange = RANGE_STEPS[tempIndex];
              dispatch(setAdvFilters({
                statuses: selStatuses,
                quickDate,
                dateFrom,
                dateTo,
                location,
                minAmount: activeRange.min,
                maxAmount: activeRange.max,
                loanType: tempLoanTypes,
                leadSources: tempSources,
              }));
              onClose();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] mb-3 py-3 text-sm font-semibold text-white transition hover:bg-[#10883c]"
          >
            Apply Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
}

export default LeadAdvancedFilters;
