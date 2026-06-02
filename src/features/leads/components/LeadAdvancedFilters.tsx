import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { SlidersHorizontal, X, Check, Phone, Calendar } from 'lucide-react';
import { STATUS_CFG, STATUS_OPTS } from '../constants/leads.constants';
import { selectAdvFilters, setAdvFilters, resetFilters } from '../store/leadSlice';

interface LeadAdvancedFiltersProps {
  onClose: () => void;
}

function LeadAdvancedFilters({ onClose }: LeadAdvancedFiltersProps) {
  const dispatch = useAppDispatch();
  const activeFilters = useAppSelector(selectAdvFilters);

  const CALL_STATUS_OPTS = ['All', 'Completed', 'Missed', 'Voicemail'];
  const QUICK_DATE_OPTS  = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];

  const [selStatuses, setSelStatuses] = useState<string[]>(activeFilters.statuses);
  const [callSt,      setCallSt]      = useState(activeFilters.callStatus);
  const [quickDate,   setQuickDate]   = useState(activeFilters.quickDate);
  const [dateFrom,    setDateFrom]    = useState(activeFilters.dateFrom);
  const [dateTo,      setDateTo]      = useState(activeFilters.dateTo);
  const [phoneNumber, setPhoneNumber] = useState(activeFilters.phoneNumber);

  const toggleStatus = (s: string) => setSelStatuses(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const activeCount =
    (selStatuses.length > 0 ? 1 : 0) +
    (callSt !== 'All'       ? 1 : 0) +
    (quickDate || dateFrom  ? 1 : 0) +
    (phoneNumber.trim()     ? 1 : 0);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[540px] flex-col bg-white shadow-2xl">

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
              {STATUS_OPTS.filter(s => s !== 'All' && s !== 'Disqualified').map(s => {
                const sel = selStatuses.includes(s);
                const dot = STATUS_CFG[s]?.dot ?? 'bg-slate-400';
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
                      <span className={`text-base font-medium ${sel ? 'text-green-700' : 'text-text-primary'}`}>{s}</span>
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
                  className={`rounded-xl border px-5 py-2.5 text-base font-medium transition ${
                    callSt === o
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text-primary'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </section>

          {/* Date Range */}
          <section>
            <p className="mb-3 text-base font-semibold text-text-primary">Date Range</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'From', val: dateFrom, set: (v: string) => { setDateFrom(v); setQuickDate(''); } },
                { label: 'To',   val: dateTo,   set: (v: string) => { setDateTo(v);   setQuickDate(''); } },
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
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    quickDate === o
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text-primary'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </section>

          {/* Phone Number */}
          <section>
            <p className="mb-3 text-base font-semibold text-text-primary">Phone Number</p>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-base text-text-primary placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
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
              setPhoneNumber('');
            }}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-4 mb-3 text-base font-medium text-text-primary transition hover:bg-slate-50"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(setAdvFilters({
                statuses: selStatuses,
                callStatus: callSt,
                quickDate,
                dateFrom,
                dateTo,
                phoneNumber
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
