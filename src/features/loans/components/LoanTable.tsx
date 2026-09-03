'use client';

import { useModalA11y } from '@/hooks/useModalA11y';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Eye, Filter, Phone } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
// createPortal removed
import { getStageStyle } from '../utils/stageStyles';
import { TableEmptyState } from '@/components/ui/TableEmptyState';
import {
  advancedFilterValues,
  resetAllFilters,
  selectAdvancedFilters, selectLoanSortBy, selectLoanSortOrder,
  selectLoanStageOptions, selectLoanStages, selectLoanTypeOptions,
  selectPagedRows,
  selectTableStatusFilters, selectTableTypeFilters,
  setAdvancedFilters, setLoanSort,
  setTableStatusFilters,
  setTableTypeFilters
} from '../store/loanDashboardSlice';
import {
  ALL_AMOUNTS_INDEX,
  loanAmountRange,
  loanAmountRangeIndex,
  LOAN_AMOUNT_RANGES,
} from '../constants/loans.constants';

export interface LoanTableRow {
  id: string;
  applicant: string;
  initials?: string;
  productName?: string;
  phone: string;
  loanAmount: string;
  amount?: string;
  type: string;
  /** The archetype state. What the status filter and the API speak. */
  status: string;
  /** What the badge shows: the owning bank's stage label, or the archetype. */
  statusLabel?: string | undefined;
  statusTone: string;
  location?: string | undefined;
  updated: string;
  action: string;
  timestamp: number;
  application_id?: string;
  creation?: string;
  region?: string | undefined;
  loanTerm?: string;
}

interface LoanTableProps {
  onView?: (row: LoanTableRow) => void;
  /** Stages the STATUS column filter offers; falls back to the bank's own list. */
  stageOptions?: readonly { label: string; value: string; color?: string; dot?: string }[];
}

type SortColumn = 'loan_amount' | 'creation';

/**
 * The sort affordance in a column header: neutral up/down arrows until the column is
 * the active sort, then the direction it is sorted in.
 *
 * Declared here rather than inside `LoanTable` because a component created in a render
 * body is a new component type on every render — React remounts it and throws away its
 * state, which is what `react-hooks/static-components` reports.
 */
function SortIndicator({ column, sortBy, sortOrder }: {
  column: SortColumn;
  sortBy: SortColumn | undefined;
  sortOrder: 'asc' | 'desc' | undefined;
}) {
  if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400" />;
  return sortOrder === 'asc'
    ? <ArrowUp size={14} className="text-emerald-600" />
    : <ArrowDown size={14} className="text-emerald-600" />;
}

const LoanTable = memo(({ onView, stageOptions }: LoanTableProps) => {
  const dispatch = useAppDispatch();
  const rows: LoanTableRow[] = useAppSelector(selectPagedRows);
  const stages = useAppSelector(selectLoanStages);
  const storeStageOptions = useAppSelector(selectLoanStageOptions);

  // The objects, not a flattened list of labels: the filter sends `value` and the
  // row shows `label`, and collapsing them to one string made the dropdown send
  // whatever it happened to display.
  const statusFilterOptions = stageOptions ?? storeStageOptions;

  const selectedStatuses = useAppSelector(selectTableStatusFilters);
  const selectedLoanTypes = useAppSelector(selectTableTypeFilters);
  const currentAdvancedFilters = useAppSelector(selectAdvancedFilters);
  const loanTypeOptions = useAppSelector(selectLoanTypeOptions);
  const sortBy = useAppSelector(selectLoanSortBy);
  const sortOrder = useAppSelector(selectLoanSortOrder);



  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [loanTypeFilterOpen, setLoanTypeFilterOpen] = useState(false);
  const [amountFilterOpen, setAmountFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const [localStatuses, setLocalStatuses] = useState<string[]>([]);
  const [localLoanTypes, setLocalLoanTypes] = useState<string[]>([]);
  const [tempQuickDate, setTempQuickDate] = useState<string>('');
  const [tempDateFrom, setTempDateFrom] = useState<string>(currentAdvancedFilters.dateFrom || '');
  const [tempDateTo, setTempDateTo] = useState<string>(currentAdvancedFilters.dateTo || '');

  // Derived, not held in local state: the amount filter lives in the store, and a
  // second copy of it here went stale the moment the drawer (or Clear Filters)
  // changed the range — the slider then showed a bucket that wasn't being applied.
  const amountIndex = loanAmountRangeIndex(
    currentAdvancedFilters.minLoan,
    currentAdvancedFilters.maxLoan
  );

  const statusRef = useRef<HTMLButtonElement>(null);
  const loanTypeRef = useRef<HTMLButtonElement>(null);
  const amountRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);

  const statusDialogRef = useModalA11y<HTMLDivElement>(statusFilterOpen, () => setStatusFilterOpen(false));
  const loanTypeDialogRef = useModalA11y<HTMLDivElement>(loanTypeFilterOpen, () => setLoanTypeFilterOpen(false));
  const amountDialogRef = useModalA11y<HTMLDivElement>(amountFilterOpen, () => setAmountFilterOpen(false));
  const dateDialogRef = useModalA11y<HTMLDivElement>(dateFilterOpen, () => setDateFilterOpen(false));

  // Seed each popup's draft from the store on the closed → open edge.
  //
  // Adjusted during render rather than in an effect. The effects these replace listed
  // the store value as a dependency, so any new array identity from the selector reset
  // the draft *while the popup was open*, discarding a selection in progress — and
  // they also tripped react-hooks/set-state-in-effect. Comparing against the previous
  // `open` flag fires only on the edge, which is what "when it opens" actually means.
  const [statusWasOpen, setStatusWasOpen] = useState(statusFilterOpen);
  if (statusFilterOpen !== statusWasOpen) {
    setStatusWasOpen(statusFilterOpen);
    if (statusFilterOpen) setLocalStatuses(selectedStatuses);
  }

  const [loanTypeWasOpen, setLoanTypeWasOpen] = useState(loanTypeFilterOpen);
  if (loanTypeFilterOpen !== loanTypeWasOpen) {
    setLoanTypeWasOpen(loanTypeFilterOpen);
    if (loanTypeFilterOpen) setLocalLoanTypes(selectedLoanTypes);
  }

  // Same for the date popup, so a window set in the advanced-filters drawer — or
  // cleared by Clear Filters — is what it reopens on. The quick-date chip stays lit
  // only while its window is still applied.
  const [dateWasOpen, setDateWasOpen] = useState(dateFilterOpen);
  if (dateFilterOpen !== dateWasOpen) {
    setDateWasOpen(dateFilterOpen);
    if (dateFilterOpen) {
      setTempDateFrom(currentAdvancedFilters.dateFrom || '');
      setTempDateTo(currentAdvancedFilters.dateTo || '');
      if (!currentAdvancedFilters.dateFrom) setTempQuickDate('');
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if ((target as Element).closest?.('.loan-filter-popup')) return;
      if (statusRef.current && !statusRef.current.contains(target)) setStatusFilterOpen(false);
      if (loanTypeRef.current && !loanTypeRef.current.contains(target)) setLoanTypeFilterOpen(false);
      if (amountRef.current && !amountRef.current.contains(target)) setAmountFilterOpen(false);
      if (dateRef.current && !dateRef.current.contains(target)) setDateFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLocalStatus = (val: string) =>
    setLocalStatuses(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);

  const toggleLocalLoanType = (val: string) =>
    setLocalLoanTypes(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);

  const handleApplyStatus = () => { dispatch(setTableStatusFilters(localStatuses)); setStatusFilterOpen(false); };
  const handleApplyLoanType = () => { dispatch(setTableTypeFilters(localLoanTypes)); setLoanTypeFilterOpen(false); };

  // `close` is false while the slider is being dragged: the single handler behind
  // both controls used to shut the popup on every tick, so the slider could only
  // ever be moved one step at a time.
  const applyAmountIndex = (idx: number, close: boolean) => {
    const range = loanAmountRange(idx);
    dispatch(setAdvancedFilters({
      ...advancedFilterValues(currentAdvancedFilters),
      minLoan: range.min,
      maxLoan: range.max,
    }));
    if (close) setAmountFilterOpen(false);
  };

  // The slider's position while it is still being dragged, held locally so the
  // committed filter does not change on every step crossed. Dispatching per tick
  // put a new object into `selectQueryParams`, and the effect watching it fired a
  // fetch for each one — a drag across the scale was four requests, three of them
  // aborted the instant they left. Null means "not dragging", so the committed
  // value shows through.
  const [draggingAmountIndex, setDraggingAmountIndex] = useState<number | null>(null);
  const displayedAmountIndex = draggingAmountIndex ?? amountIndex;

  const commitAmountDrag = () => {
    if (draggingAmountIndex === null) return;
    applyAmountIndex(draggingAmountIndex, false);
    setDraggingAmountIndex(null);
  };

  const handleApplyDate = () => {
    dispatch(setAdvancedFilters({
      ...advancedFilterValues(currentAdvancedFilters),
      dateFrom: tempDateFrom,
      dateTo: tempDateTo,
    }));
    setDateFilterOpen(false);
  };

  /**
   * Sorting is server-side, so a header click re-queries: same column toggles the
   * direction, a new column starts descending. Clicking the active column while it
   * is ascending clears the sort back to the endpoint's default.
   */
  const handleSort = (column: SortColumn) => {
    if (sortBy !== column) {
      dispatch(setLoanSort({ sortBy: column, sortOrder: 'desc' }));
    } else if (sortOrder === 'desc') {
      dispatch(setLoanSort({ sortBy: column, sortOrder: 'asc' }));
    } else {
      dispatch(setLoanSort({}));
    }
  };

  /** Spread into each header's <SortIndicator/>, so only the column differs there. */
  const sortProps = { sortBy, sortOrder };

  // Every filter surface this table can reach, not just the ones it renders itself:
  // the advanced-filters drawer writes to the same slice, so leaving its fields out
  // made a filtered-empty table offer the "create your first loan" empty state.
  const hasFilters = selectedStatuses.length > 0
    || selectedLoanTypes.length > 0
    || currentAdvancedFilters.status.length > 0
    || currentAdvancedFilters.type.length > 0
    || currentAdvancedFilters.minLoan !== null
    || currentAdvancedFilters.maxLoan !== null
    || Boolean(currentAdvancedFilters.region)
    || Boolean(currentAdvancedFilters.dateFrom)
    || Boolean(currentAdvancedFilters.dateTo);

  // One reducer for the lot. Clearing only the column filters here left the
  // drawer's status/type/amount/date/region still narrowing the request, so
  // "Clear Filters" could leave the table just as empty as it found it.
  const handleClearFilters = () => {
    dispatch(resetAllFilters());
    setLocalStatuses([]);
    setLocalLoanTypes([]);
    setTempDateFrom('');
    setTempDateTo('');
    setTempQuickDate('');
  };

  return (
    <div className="flex flex-col min-h-[515px]">
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full border-collapse text-left text-base text-gray-500 whitespace-nowrap">
          <thead className="bg-[#fafafa] text-[13px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Application ID</th>
              <th className="px-6 py-4 font-semibold">Phone Number</th>

              {/* Status */}
              <th className="px-6 py-4 font-semibold">
                <div className="relative inline-flex items-center gap-2">
                  <span>Status</span>
                  <button
                    ref={statusRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!statusFilterOpen) setLocalStatuses(selectedStatuses);
                      setStatusFilterOpen(!statusFilterOpen);
                    }}
                    className={`p-1 rounded transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${statusFilterOpen || selectedStatuses.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    <Filter size={15} strokeWidth={2} />
                  </button>
                  {statusFilterOpen && (
                    <div
                      ref={statusDialogRef}
                      className="absolute left-0 top-full mt-2 z-[99] w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 normal-case font-normal text-sm text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2 font-semibold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        Status Filter
                      </div>
                      <div className="max-h-62 overflow-y-auto py-1">
                        {/* "All" is not a stage — it is the no-filter position, so it
                            selects nothing rather than sending a value. The rest come
                            from the bank's own stages; the display labels that used to
                            be hardcoded here ('In Underwriting', 'Review', 'Approved',
                            'Pending', 'Rejected') belong to no bank's pipeline. */}
                        <button
                          type="button"
                          onClick={() => setLocalStatuses([])}
                          className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-left focus:outline-none focus-visible:bg-gray-50"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${localStatuses.length === 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
                            {localStatuses.length === 0 && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="text-sm font-semibold">All</span>
                        </button>
                        {statusFilterOptions.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-gray-400">
                            No stages defined for this bank yet.
                          </p>
                        ) : statusFilterOptions.map((opt) => {
                          const isChecked = localStatuses.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleLocalStatus(opt.value)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-left focus:outline-none focus-visible:bg-gray-50"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
                                {isChecked && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span className={`h-2 w-2 shrink-0 rounded-full ${opt.dot ?? "bg-slate-400"}`} aria-hidden="true" />
                              <span className="text-sm font-semibold">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => { setLocalStatuses([]); dispatch(setTableStatusFilters([])); setStatusFilterOpen(false); }}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                        >
                          <span className='font-semibold'>Clear</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyStatus}
                          className="px-3.5 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <span className='font-semibold'>Apply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </th>

              {/* Loan Type — the field this column's filter actually sends */}
              <th className="px-6 py-4 font-semibold">
                <div className="relative inline-flex items-center gap-2">
                  <span>Loan Type</span>
                  <button
                    ref={loanTypeRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loanTypeFilterOpen) setLocalLoanTypes(selectedLoanTypes);
                      setLoanTypeFilterOpen(!loanTypeFilterOpen);
                    }}
                    className={`p-1 rounded transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${loanTypeFilterOpen || selectedLoanTypes.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    <Filter size={15} strokeWidth={2} />
                  </button>
                  {loanTypeFilterOpen && (
                    <div
                      ref={loanTypeDialogRef}
                      className="absolute left-0 top-full mt-2 z-[99] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 normal-case font-normal text-sm text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2 font-semibold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        Loan Type
                      </div>
                      <div className="max-h-62 overflow-y-auto py-1">
                        {/* Built from the loan types actually seen, not a fixed list of
                            product names: the filter sends `loan_type`, and the three
                            CBE product names hardcoded here matched no record. */}
                        <button
                          type="button"
                          onClick={() => setLocalLoanTypes([])}
                          className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-left focus:outline-none focus-visible:bg-gray-50"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${localLoanTypes.length === 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
                            {localLoanTypes.length === 0 && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="text-sm font-semibold">All</span>
                        </button>
                        {loanTypeOptions.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-gray-400">
                            No loan types seen yet — they appear as applications load.
                          </p>
                        ) : (
                          loanTypeOptions.map((opt) => {
                            const isChecked = localLoanTypes.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleLocalLoanType(opt)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 text-left focus:outline-none focus-visible:bg-gray-50"
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
                                  {isChecked && <Check size={12} strokeWidth={3} />}
                                </div>
                                <span className="text-sm font-semibold">{opt}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => { setLocalLoanTypes([]); dispatch(setTableTypeFilters([])); setLoanTypeFilterOpen(false); }}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                        >
                          <span className='font-semibold'>Clear</span>

                        </button>
                        <button
                          type="button"
                          onClick={handleApplyLoanType}
                          className="px-3.5 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >

                          <span className='font-semibold'>Apply</span>

                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </th>

              {/* Amount */}
              <th className="px-6 py-4 font-semibold">
                <div className="relative inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSort('loan_amount')}
                    aria-label="Sort by amount"
                    className="inline-flex items-center gap-1.5 rounded transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                  >
                    <span>Amount (ETB)</span>
                    <SortIndicator column="loan_amount" {...sortProps} />
                  </button>
                  <button
                    ref={amountRef}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAmountFilterOpen(!amountFilterOpen); }}
                    className={`p-1 rounded transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${amountFilterOpen || amountIndex !== ALL_AMOUNTS_INDEX ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    <Filter size={15} strokeWidth={2} />
                  </button>
                  {amountFilterOpen && (
                    <div
                      ref={amountDialogRef}
                      className="absolute left-0 top-full mt-2 z-[99] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 normal-case font-normal text-sm text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Loan Amount
                      </div>

                      {/* Slider */}
                      <div className="space-y-4 mb-5">
                        <div className="relative w-full">
                          <div className="h-2 w-full bg-gray-200 rounded-full relative">
                            <div
                              className="absolute left-0 top-0 h-full bg-[#16A34A] rounded-full"
                              style={{ width: `${(displayedAmountIndex / ALL_AMOUNTS_INDEX) * 100}%` }}
                            />
                            <input
                              type="range"
                              min="0"
                              max={ALL_AMOUNTS_INDEX}
                              step="1"
                              value={displayedAmountIndex}
                              onChange={(e) => setDraggingAmountIndex(Number(e.target.value))}
                              // Commit on release, not per step. `onKeyUp` covers the
                              // keyboard, where arrow keys drive the same handle, and
                              // `onBlur` catches a pointer released off the control.
                              onPointerUp={commitAmountDrag}
                              onKeyUp={commitAmountDrag}
                              onBlur={commitAmountDrag}
                              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                              className="absolute w-5 h-5 bg-white border-2 border-emerald-600 rounded-full -top-1.5 -ml-2.5 pointer-events-none shadow-sm"
                              style={{ left: `${(displayedAmountIndex / ALL_AMOUNTS_INDEX) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                          <div>
                            <span className="block text-[10px] text-gray-400">ETB</span>
                            <span>0</span>
                          </div>
                          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md border border-emerald-100 font-extrabold">
                            {loanAmountRange(displayedAmountIndex).display}
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-gray-400">ETB</span>
                            {/* The top bucket has no ceiling; the flat "1000000" that
                                stood here described a cap that no longer exists. */}
                            <span>100,000+</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-gray-100 pt-3">
                        {LOAN_AMOUNT_RANGES.slice(0, ALL_AMOUNTS_INDEX).map((opt, idx) => {
                          const isSel = displayedAmountIndex === idx;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              // Selecting the chosen bucket again clears the filter
                              // rather than re-applying it — otherwise the only way
                              // back to "all amounts" was the slider's far end.
                              onClick={() => applyAmountIndex(isSel ? ALL_AMOUNTS_INDEX : idx, true)}
                              className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-left focus:outline-none focus-visible:bg-gray-50"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSel ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
                                {isSel && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </th>

              {/* Applied (Date Filter) */}
              <th className="px-6 py-4 font-semibold text-center">
                <div className="relative inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSort('creation')}
                    aria-label="Sort by application date"
                    className="inline-flex items-center gap-1.5 rounded transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                  >
                    <span>Applied</span>
                    <SortIndicator column="creation" {...sortProps} />
                  </button>
                  <button
                    ref={dateRef}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDateFilterOpen(!dateFilterOpen); }}
                    className={`p-1 rounded transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${dateFilterOpen || currentAdvancedFilters.dateFrom ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    <Filter size={15} strokeWidth={2} />
                  </button>
                  {dateFilterOpen && (
                    <div
                      ref={dateDialogRef}
                      className="absolute right-0 top-full mt-2 z-[99] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 normal-case font-normal text-sm text-gray-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Date Filter
                      </div>

                      <div className="space-y-2 mb-4">
                        {[
                          { label: 'Today', days: 0 },
                          { label: 'Yesterday', days: 1 },
                          { label: 'Last 7 Days', days: 7 },
                          { label: 'Last 30 Days', days: 30 },
                          { label: 'Last 90 Days', days: 90 },
                        ].map((o) => {
                          const isChecked = tempQuickDate === o.label;
                          return (
                            <button
                              key={o.label}
                              type="button"
                              onClick={() => {
                                setTempQuickDate(o.label);
                                const to = new Date();
                                const from = new Date();
                                if (o.days === 1) {
                                  from.setDate(from.getDate() - 1);
                                  to.setDate(to.getDate() - 1);
                                } else {
                                  from.setDate(from.getDate() - o.days);
                                }
                                setTempDateFrom(from.toISOString().split('T')[0] ?? '');
                                setTempDateTo(to.toISOString().split('T')[0] ?? '');
                              }}
                              className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-left focus:outline-none focus-visible:bg-gray-50"
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isChecked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'}`}>
                                {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{o.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-gray-100 pt-3 space-y-2">
                        <span className="block text-sm font-bold text-gray-500">Default Date</span>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="block text-[12px] text-gray-400 mb-1">From</span>
                            <input
                              type="date"
                              value={tempDateFrom}
                              onChange={(e) => setTempDateFrom(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-1.5 text-sm text-gray-700"
                            />
                          </div>
                          <div>
                            <span className="block text-[12px] text-gray-400 mb-1">To</span>
                            <input
                              type="date"
                              value={tempDateTo}
                              onChange={(e) => setTempDateTo(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg p-1.5 text-sm text-gray-700"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyDate}
                          className="w-full mt-3 py-3 bg-[#16A34A] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                        >

                          <span className='font-semibold'> Apply Search</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </th>

              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.length === 0 ? (
              <TableEmptyState
                hasFilters={hasFilters}
                onClearFilters={handleClearFilters}
                colSpan={7}
                emptyTitle="No loans yet"
                emptyDescription="Create your first loan to get started with the pipeline."
                filteredTitle="No loans match your filters"
              />
            ) : (
              rows.map((row, i) => {
                // Keyed on the badge text (the bank's stage label, or the archetype
                // behind it), matching what the pill actually shows. The substring
                // tests that stood here ('processing', 'approved', 'rejected') looked
                // for words no state machine emits, so every row fell through to grey.
                const stageStyle = getStageStyle(row.statusLabel || row.status, stages);
                const badgeColor = stageStyle.badge;
                const dotColor = stageStyle.dot;

                const updatedParts = row.updated.split(' · ');
                const datePart = updatedParts[0];
                const timePart = updatedParts[1];

                return (
                  <tr
                    key={`${row.id}-${i}`}
                    className="transition-colors hover:bg-gray-50/50 group"
                  >
                    <td className="px-6 py-5">
                      <strong className="block text-base font-semibold text-[#16A34A]">{row.application_id || row.id}</strong>
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
                      {/* The bank's own label for the step, falling back to the
                          archetype. This used to run the status through
                          .replace(/Verified|Approved/, 'Granted').replace(/Active/,
                          'Processing') — inventing words for states, and showing
                          "Processing" for an application nobody had touched. */}
                      <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${badgeColor}`}>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} aria-hidden="true" />
                        {row.statusLabel || row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-700">
                      {/* `type` is the `loan_type` this column's filter sends. Showing
                          productName first meant the cell and its filter described
                          different fields, so a visible value could not be filtered on. */}
                      <span className="block">{row.type}</span>
                      {row.productName && (
                        <span className="mt-0.5 block text-xs font-normal text-gray-400">{row.productName}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-700">{row.loanAmount}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col text-sm text-gray-500">
                        <span>{datePart}</span>
                        {timePart && <span className="text-xs text-gray-400">{timePart}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => onView?.(row)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95"
                        >
                          <Eye size={16} className="text-gray-600" />
                          <span className='font-semibold'>View</span>
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

    </div>
  );
});

LoanTable.displayName = 'LoanTable';
export default LoanTable;
