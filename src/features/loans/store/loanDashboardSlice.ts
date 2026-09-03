import { GetLoansParams, LoanApplicationSummary, loanService, LoanSummaryMetrics } from '@/features/loans/api/loan.service';
import { bucketStagesByArchetype, toPseudoStages } from '@/features/loans/utils/archetype';
import { loanStagesService } from '@/features/loans/api/loanStages.service';
import { formatLocation } from '@/features/loans/utils/formatLocation';
import { buildStageKpiCards, compareStageSequence, getStageStyle, toStageFilterOptions } from '@/features/loans/utils/stageStyles';
import type { LoanStage, LoanStatusMeta } from '@/lib/api/api.schemas';
import { withCurrentSort } from '@/lib/filterSort';
import type { ApiResponse } from '@/types/api';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { selectUserEmail, type RootState } from '../../../store';

export const fetchLoans = createAsyncThunk(
  'loanDashboard/fetchLoans',
  async (params: GetLoansParams | undefined, { signal, rejectWithValue }) => {
    try {
      const response = await loanService.getLoans(params, { signal });
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch loans';
      return rejectWithValue(message);
    }
  }
);

/**
 * Loads the statuses the signed-in user can see.
 *
 * Reads `get_loan_metadata`, not the seller `get_stages` endpoint this used to
 * call: `get_stages` is a bank API guarded by a bank binding, so the Development
 * Agent driving this dashboard got a 403 and the filters were left with nothing
 * to offer. `get_loan_metadata` resolves per role — the union across banks for a
 * Dev Agent, the caller's own stages for a bank user.
 */
export const fetchLoanStages = createAsyncThunk(
  'loanDashboard/fetchLoanStages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getLoanMetadata();
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch loan stages';
      return rejectWithValue(message);
    }
  }
);

export const fetchLoanSummary = createAsyncThunk(
  'loanDashboard/fetchLoanSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getLoanSummary();
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch loan summary';
      return rejectWithValue(message);
    }
  }
);

/**
 * The signed-in bank's own pipeline, from the seller `get_stages` endpoint.
 *
 * Deliberately separate from `fetchLoanStages` above, which reads
 * `get_loan_metadata` because that one has to serve the Development Agent too
 * and `get_stages` 403s for anyone without a bank binding. This is only ever
 * dispatched from the bank admin dashboard, and it is worth the second call:
 * only `get_stages` carries `sequence` and `archetype_state`, which is what
 * lets the status picker order a bank's stages and colour them by outcome
 * instead of guessing from label text.
 */
export const fetchBankPipelineStages = createAsyncThunk(
  'loanDashboard/fetchBankPipelineStages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanStagesService.getStages();
      return response.data.stages;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to fetch bank stages';
      return rejectWithValue(message);
    }
  }
);

export const updateLoanStatus = createAsyncThunk(
  'loanDashboard/updateLoanStatus',
  async ({ id, status, reason }: { id: string; status: string; reason?: string }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await loanService.updateLoanStatus(id, status, reason);
      // Re-fetch with the user's current filters/pagination (not the defaults) so the view doesn't silently reset.
      dispatch(fetchLoans(selectQueryParams(getState() as RootState)));
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update loan status';
      return rejectWithValue(message);
    }
  }
);

export interface MappedLoanRow extends Omit<LoanApplicationSummary, 'status'> {
  id: string;
  applicant: string;
  initials?: string;
  productName?: string;
  phone: string;
  loanAmount: string;
  type: string;
  /** Region · Woreda, built from the hierarchy fields the endpoint returns. */
  location: string;
  /**
   * The application's status as the owning bank decided it — the backend resolves
   * the stage, the client only renders it. Also what the status filter speaks.
   */
  status: string;
  /** What the badge shows. Same string as `status`. */
  statusLabel: string;
  statusTone: string;
  updated: string;
  timestamp: number;
  action: string;
}

export interface AdvancedFilters {
  status: string[];
  minLoan: number | null;
  maxLoan: number | null;
  type: string[];
  /** Prefix-matched against `region`. See BankApplicationFilters.region. */
  region: string;
  dateFrom: string;
  dateTo: string;
  sortBy?: 'loan_amount' | 'creation';
  sortOrder?: 'asc' | 'desc';
}

/** What the drawer can set — everything except the sort, which it does not own. */
export type AdvancedFilterValues = Omit<AdvancedFilters, 'sortBy' | 'sortOrder'>;

/**
 * The filter half of the current filter state, ready to hand back to
 * `setAdvancedFilters` with one field changed.
 *
 * Call sites that tweak a single filter used to spread the whole `AdvancedFilters`
 * object into the payload, which carried `sortBy`/`sortOrder` along with it and made
 * every one of them a place the sort could be reset by accident. Fields are listed
 * out rather than rest-destructured so adding one to `AdvancedFilters` is a type
 * error here instead of a value that silently stops being sent.
 */
export function advancedFilterValues(filters: AdvancedFilters): AdvancedFilterValues {
  return {
    status: filters.status,
    minLoan: filters.minLoan,
    maxLoan: filters.maxLoan,
    type: filters.type,
    region: filters.region,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}

interface LoanDashboardState {
  rawActivityData: ApiResponse<LoanApplicationSummary[]> | null;
  isLoading: boolean;
  loansError: string | null;
  // The most recently *dispatched* fetchLoans requestId — including the
  // untracked one updateLoanStatus fires after a status change, which has no
  // component-side abort to rely on. Gates .fulfilled/.rejected so a slower
  // older request can never overwrite a newer one's result, regardless of
  // which order they settle in.
  latestFetchRequestId: string | null;
  rawSummaryData: ApiResponse<LoanSummaryMetrics> | null;
  isSummaryLoading: boolean;
  summaryError: string | null;

  /** Raw caller-scoped status metadata from `get_loan_metadata`. */
  statuses: LoanStatusMeta[];
  /** The same list in `LoanStage` shape, for the badge/filter helpers. */
  stages: LoanStage[];
  isStagesLoading: boolean;
  stagesError: string | null;

  /** The signed-in bank's own pipeline from `get_stages`. Bank users only —
   *  stays empty for a Development Agent, who has no bank binding. */
  pipelineStages: LoanStage[];
  isPipelineStagesLoading: boolean;
  pipelineStagesError: string | null;

  // UI State
  activityPage: number;
  activeTab: 'all' | 'my' | 'unassigned';
  searchQuery: string;
  tableStatusFilters: string[];
  tableTypeFilters: string[];
  /**
   * Every `loan_type` seen so far, unioned across fetches and never pruned.
   *
   * The loan-type filters cannot be derived from the rows on screen: filtering is
   * server-side, so picking one type would shrink the option list to exactly that
   * type and leave no way back. Accumulating means the list only grows as pages are
   * visited, and a chosen value is always still selectable. (Same reasoning, and
   * the same mechanism, as `knownLoanTypes` on bankApplicationsSlice.)
   */
  knownLoanTypes: string[];
  pageSize: number;
  advancedFilters: AdvancedFilters;
}

// Shared by initialState and every "clear filters" reducer below, so the
// three can't silently drift apart when a field is added to AdvancedFilters.
const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  status: [],
  minLoan: null,
  maxLoan: null,
  type: [],
  region: '',
  dateFrom: '',
  dateTo: '',
};

const initialState: LoanDashboardState = {
  rawActivityData: null,
  isLoading: false,
  loansError: null,
  latestFetchRequestId: null,
  rawSummaryData: null,
  isSummaryLoading: false,
  summaryError: null,

  statuses: [],
  stages: [],
  pipelineStages: [],
  isPipelineStagesLoading: false,
  pipelineStagesError: null,
  isStagesLoading: false,
  stagesError: null,

  activityPage: 1,
  activeTab: 'all',
  searchQuery: '',
  tableStatusFilters: [],
  tableTypeFilters: [],
  knownLoanTypes: [],
  pageSize: 10,
  advancedFilters: { ...DEFAULT_ADVANCED_FILTERS },
};

const loanDashboardSlice = createSlice({
  name: 'loanDashboard',
  initialState,
  reducers: {
    toggleTableStatusFilter: (state, action: PayloadAction<string>) => {
      const val = action.payload;
      if (state.tableStatusFilters.includes(val)) {
        state.tableStatusFilters = state.tableStatusFilters.filter(s => s !== val);
      } else {
        state.tableStatusFilters.push(val);
      }
      state.activityPage = 1;
    },
    toggleTableTypeFilter: (state, action: PayloadAction<string>) => {
      const val = action.payload;
      if (state.tableTypeFilters.includes(val)) {
        state.tableTypeFilters = state.tableTypeFilters.filter(s => s !== val);
      } else {
        state.tableTypeFilters.push(val);
      }
      state.activityPage = 1;
    },
    setTableStatusFilters: (state, action: PayloadAction<string[]>) => {
      state.tableStatusFilters = action.payload;
      state.activityPage = 1;
    },
    setTableTypeFilters: (state, action: PayloadAction<string[]>) => {
      state.tableTypeFilters = action.payload;
      state.activityPage = 1;
    },
    clearTableFilters: (state) => {
      state.tableStatusFilters = [];
      state.tableTypeFilters = [];
      state.activityPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.activityPage = 1;
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'my' | 'unassigned'>) => {
      state.activeTab = action.payload;
      state.activityPage = 1; // Reset pagination on tab change
    },
    setActivityPage: (state, action: PayloadAction<number>) => {
      state.activityPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.activityPage = 1; // reset to page 1
    },
    // Takes the filter values only, and keeps the current sort: the drawer has no
    // sort control, so replacing the whole object with its payload silently reset
    // the column sort every time someone pressed Apply.
    setAdvancedFilters: (state, action: PayloadAction<AdvancedFilterValues>) => {
      state.advancedFilters = withCurrentSort(action.payload, state.advancedFilters);
      state.activityPage = 1;
    },
    clearAdvancedFilters: (state) => {
      state.advancedFilters = withCurrentSort(DEFAULT_ADVANCED_FILTERS, state.advancedFilters);
      state.activityPage = 1;
    },
    // The toolbar's "Clear Filters" needs to reset every independent filter
    // surface (badges, column filters, advanced filters, search) in one go —
    // clearAdvancedFilters alone left tableStatusFilters/tableTypeFilters/
    // searchQuery untouched, so a bad value picked from a column filter survived
    // a "clear" and kept the same broken request firing.
    resetAllFilters: (state) => {
      state.searchQuery = '';
      state.tableStatusFilters = [];
      state.tableTypeFilters = [];
      state.advancedFilters = withCurrentSort(DEFAULT_ADVANCED_FILTERS, state.advancedFilters);
      state.activityPage = 1;
    },
    setLoanSort: (state, action: PayloadAction<{ sortBy?: 'loan_amount' | 'creation'; sortOrder?: 'asc' | 'desc' }>) => {
      if (action.payload.sortBy !== undefined) {
        state.advancedFilters.sortBy = action.payload.sortBy;
      } else {
        delete state.advancedFilters.sortBy;
      }
      if (action.payload.sortOrder !== undefined) {
        state.advancedFilters.sortOrder = action.payload.sortOrder;
      } else {
        delete state.advancedFilters.sortOrder;
      }
      state.activityPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLoans
      .addCase(fetchLoans.pending, (state, action) => {
        state.latestFetchRequestId = action.meta.requestId;
        state.isLoading = true;
        state.loansError = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        // Ignore a response for a request that's been superseded by a newer
        // one (e.g. updateLoanStatus's untracked refetch resolving after the
        // user has since changed filters) — only the latest dispatch may write.
        if (action.meta.requestId !== state.latestFetchRequestId) return;
        state.isLoading = false;
        state.rawActivityData = action.payload;

        // Union, never replace — see `knownLoanTypes`. A server-side filter on
        // loan_type would otherwise narrow its own option list to the one value
        // already chosen.
        for (const row of action.payload?.data ?? []) {
          const loanType = row.loan_type;
          if (loanType && !state.knownLoanTypes.includes(loanType)) {
            state.knownLoanTypes.push(loanType);
          }
        }
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        // Ignore aborted requests, and any response for a superseded request —
        // the newer request's pending/fulfilled owns the loading/error state.
        if (action.meta.aborted) return;
        if (action.meta.requestId !== state.latestFetchRequestId) return;
        state.isLoading = false;
        state.loansError = action.payload as string;
      })
      // fetchLoanStages — without these three cases the thunk resolved into
      // nowhere: `stages` stayed empty forever, so the status dropdown fell back
      // to a hardcoded list and the KPI cards rendered dashes.
      .addCase(fetchLoanStages.pending, (state) => {
        state.isStagesLoading = true;
        state.stagesError = null;
      })
      .addCase(fetchLoanStages.fulfilled, (state, action) => {
        state.isStagesLoading = false;
        const statuses: LoanStatusMeta[] = action.payload?.data?.statuses ?? [];
        state.statuses = statuses;
        state.stages = toPseudoStages(statuses);
      })
      .addCase(fetchLoanStages.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.isStagesLoading = false;
        state.stagesError = action.payload as string;
      })
      // fetchBankPipelineStages
      .addCase(fetchBankPipelineStages.pending, (state) => {
        state.isPipelineStagesLoading = true;
        state.pipelineStagesError = null;
      })
      .addCase(fetchBankPipelineStages.fulfilled, (state, action) => {
        state.isPipelineStagesLoading = false;
        state.pipelineStages = action.payload;
      })
      .addCase(fetchBankPipelineStages.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.isPipelineStagesLoading = false;
        state.pipelineStagesError = action.payload as string;
      })
      // fetchLoanSummary
      .addCase(fetchLoanSummary.pending, (state) => {
        state.isSummaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchLoanSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.rawSummaryData = action.payload;
      })
      .addCase(fetchLoanSummary.rejected, (state, action) => {
        state.isSummaryLoading = false;
        state.summaryError = action.payload as string;
      });
  },
});

export const {
  setActivityPage,
  setActiveTab,
  setSearchQuery,
  toggleTableStatusFilter,
  toggleTableTypeFilter,
  setTableStatusFilters,
  setTableTypeFilters,
  clearTableFilters,
  setPageSize,
  setAdvancedFilters,
  clearAdvancedFilters,
  resetAllFilters,
  setLoanSort
} = loanDashboardSlice.actions;

// --- Basic Selectors ---
export const selectRawActivityData = (state: RootState) => state.loanDashboard.rawActivityData;
export const selectIsLoansLoading = (state: RootState) => state.loanDashboard.isLoading;
export const selectLoansError = (state: RootState) => state.loanDashboard.loansError;
export const selectRawSummaryData = (state: RootState) => state.loanDashboard.rawSummaryData;
export const selectLoanStages = (state: RootState) => state.loanDashboard.stages;
export const selectLoanStatusMeta = (state: RootState) => state.loanDashboard.statuses;
export const selectIsLoanStagesLoading = (state: RootState) => state.loanDashboard.isStagesLoading;
export const selectLoanStagesError = (state: RootState) => state.loanDashboard.stagesError;
export const selectActivityPage = (state: RootState) => state.loanDashboard.activityPage;
export const selectActiveTab = (state: RootState) => state.loanDashboard.activeTab;
export const selectSearchQuery = (state: RootState) => state.loanDashboard.searchQuery;
export const selectTableStatusFilters = (state: RootState) => state.loanDashboard.tableStatusFilters;
export const selectTableTypeFilters = (state: RootState) => state.loanDashboard.tableTypeFilters;
export const selectPageSize = (state: RootState) => state.loanDashboard.pageSize;
export const selectAdvancedFilters = (state: RootState) => state.loanDashboard.advancedFilters;
export const selectLoanSortBy = (state: RootState) => state.loanDashboard.advancedFilters.sortBy;
export const selectLoanSortOrder = (state: RootState) => state.loanDashboard.advancedFilters.sortOrder;
const selectKnownLoanTypes = (state: RootState) => state.loanDashboard.knownLoanTypes;

/**
 * Loan types offered by the LOAN TYPE column filter and the advanced-filters drawer.
 *
 * `loan_type` is a free-text `Data` field on A2C Loan Application, filled from
 * whatever the credit-information record carried — there is no enum to render, and
 * the six hardcoded strings that used to stand in for one matched no real record.
 * Everything seen so far, unioned with whatever is currently selected so a chosen
 * value is never missing from the list meant to let you unselect it.
 */
export const selectLoanTypeOptions = createSelector(
  [selectKnownLoanTypes, selectTableTypeFilters, selectAdvancedFilters],
  (known, tableTypes, advanced) =>
    Array.from(new Set([...known, ...tableTypes, ...advanced.type])).sort()
);

export const selectLoanStageOptions = createSelector([selectLoanStages], (stages) => toStageFilterOptions(stages));

export const selectBankPipelineStages = (state: RootState) => state.loanDashboard.pipelineStages;
export const selectBankPipelineStagesError = (state: RootState) => state.loanDashboard.pipelineStagesError;

/**
 * The bank's stages in pipeline order, for the status picker.
 *
 * Sorted by `sequence` rather than left in response order: the picker presents a
 * progression, and a stage list that arrives unordered would read as an
 * arbitrary jumble of the bank's own workflow.
 */
export const selectOrderedBankPipelineStages = createSelector(
  [selectBankPipelineStages],
  (stages) => [...stages].sort(compareStageSequence)
);

// --- Derived Memoized Selectors ---
export const selectPagedRowsData = createSelector(
  [selectRawActivityData, selectPageSize, selectLoanStages],
  (rawActivityData, _pageSize, stages) => {
    // fetchApi automatically unwraps the "message" envelope, so the data is directly on rawActivityData
    const rows = rawActivityData?.data || [];

    const totalCount = rawActivityData?.pagination?.total ?? 0;

    const mapped = rows.map((row: LoanApplicationSummary): MappedLoanRow => {
      const rawDate = row.creation ? new Date(row.creation) : new Date();
      const dateStr = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const appId = row.application_id || '';
      const formattedId = appId;

      const firstName = row.first_name || '';
      const lastName = row.last_name || '';
      const applicantName = `${firstName} ${lastName}`.trim();
      const location = formatLocation(row);
      const status = row.status;
      const stageStyle = getStageStyle(status, stages);

      return {
        ...row,
        id: formattedId,
        applicant: applicantName,
        phone: row.phone_number || '',
        loanAmount: row.loan_amount != null ? row.loan_amount.toLocaleString() : '—',
        type: row.loan_type || 'Unknown Type',
        // A dash, not an empty cell: the record genuinely carries no location yet.
        location: location || '—',
        // Badge text and filter value are deliberately the same string: the
        // backend decides the status, so what you can see is what you can
        // filter on.
        status,
        statusLabel: status,
        statusTone: stageStyle.tone,
        updated: `${dateStr} · ${timeStr}`,
        timestamp: rawDate.getTime(),
        action: 'View',
      };
    });

    const totalPages = rawActivityData?.pagination?.total_pages || 1;
    return { pagedRows: mapped, totalPages, totalCount };
  }
);

export const selectPagedRows = createSelector([selectPagedRowsData], (data) => data.pagedRows);
export const selectTotalPages = createSelector([selectPagedRowsData], (data) => data.totalPages);
export const selectTotalCount = createSelector([selectPagedRowsData], (data) => data.totalCount);

/**
 * KPI figures for the loan dashboard.
 *
 * `get_loan_summary` reports counts per *bank-defined stage label*, which the
 * client cannot interpret on its own — one bank's "Underwriting" is another's
 * "Credit Review". The caller-scoped status metadata is what classifies each
 * label into an archetype bucket. (The previous fallback read
 * `summary.by_status`, a key the endpoint has never sent, so these cards showed
 * a permanent dash whenever the stage list was empty — which, for the
 * Development Agent, was always.)
 */
export const selectLiveMetrics = createSelector(
  [selectRawSummaryData, selectLoanStatusMeta],
  (rawSummaryData, statusMeta) => {
    const summaryData = rawSummaryData?.data;
    const counts = bucketStagesByArchetype(summaryData?.stages, statusMeta);
    // Total comes from the endpoint's own figure, not the sum of the buckets: a
    // loan sitting on a stage that was renamed between the two requests still
    // has to be counted somewhere.
    const total = summaryData?.total ?? counts.total;
    const show = (value: number | undefined) => (typeof value === 'number' ? value.toString() : '—');

    return {
      total: { value: show(total) },
      in_transition: { value: (counts.active + counts.inTransition).toString() },
      completed: { value: counts.completed.toString() },
      cancelled: { value: counts.cancelled.toString() },
    };
  }
);

/**
 * One KPI card per stage, for the cross-bank dashboard.
 *
 * The two halves come from different endpoints because neither has both:
 * `get_loan_metadata` describes the pipeline (label, ordering, archetype) but
 * carries no counts, while `get_loan_summary().stages` carries counts keyed by
 * label but says nothing about what a label means or where it sits. Joined on
 * the label, ordered by `sequence` so the row reads in the order an application
 * actually travels.
 *
 * Spanning every bank, the union can hold two stages sharing a label — counts
 * for those merge, which is the reading a cross-bank total wants anyway.
 */
export const selectLoanStageCards = createSelector(
  [selectLoanStatusMeta, selectRawSummaryData],
  (statusMeta, rawSummaryData) =>
    buildStageKpiCards(toPseudoStages(statusMeta), rawSummaryData?.data?.stages)
);

export const selectTabCounts = createSelector(
  [selectRawSummaryData],
  (rawSummaryData) => {
    const tc = rawSummaryData?.data?.tab_counts;
    return tc ?? null;
  }
);


export const selectQueryParams = createSelector(
  [selectActivityPage, selectPageSize, selectSearchQuery, selectActiveTab, selectTableStatusFilters, selectTableTypeFilters, selectAdvancedFilters, selectLoanStatusMeta, selectUserEmail],
  (activityPage, pageSize, searchQuery, activeTab, tableStatusFilters, tableTypeFilters, advancedFilters, statusMeta, userEmail) => {
    const params: GetLoansParams = {
      page: activityPage,
      page_size: pageSize,
    };

    if (searchQuery) params.search_query = searchQuery;
    // Scope the queue server-side via loan_officer (get_all_loans): "My" → my
    // email, "Unassigned" → the literal 'unassigned', "All" → omit. `unassigned`
    // is the only literal the filter understands; the 'my' this used to send was
    // matched against the User table as if it were an address and returned an
    // empty queue for everyone.
    if (activeTab === 'my') {
      if (userEmail) params.loan_officer = userEmail;
    } else if (activeTab === 'unassigned') {
      params.loan_officer = 'unassigned';
    }

    // The only date window is the one someone picked in the drawer. A default
    // "last 30 days" used to be applied here from a toolbar control that was never
    // rendered, so anything older was invisible with no filter chip to explain it.
    if (advancedFilters.dateFrom) {
      const datePart = advancedFilters.dateFrom.split('T')[0];
      if (datePart) params.from_date = datePart;
    }
    if (advancedFilters.dateTo) {
      const datePart = advancedFilters.dateTo.split('T')[0];
      if (datePart) params.to_date = datePart;
    }

    // Status filtering speaks the caller's *own* pipeline vocabulary.
    //
    // `get_all_loans` validates every value against the stages visible to the
    // caller and answers 400 for anything it does not recognise — so a value
    // that is not in the metadata is dropped here rather than sent and failed.
    // (The retired fixed vocabulary this used to emit — 'Pending Review',
    // 'Processing', 'Action Required', 'Draft' — 400s every request that carried
    // it, taking the whole table down with it, and so did the `__NONE__`
    // sentinel that stood for "no statuses selected".)
    const requested = [...new Set([...tableStatusFilters, ...advancedFilters.status])];
    const statusesToPass = statusMeta.length > 0
      ? requested.filter((value) =>
          statusMeta.some((meta) =>
            meta.status.toLowerCase() === value.toLowerCase() ||
            meta.stage_id?.toLowerCase() === value.toLowerCase()
          )
        )
      : requested;

    if (statusesToPass.length > 0) {
      // JSON array rather than a comma-joined string: a bank is free to name a
      // stage "Approved, Pending Disbursal", and splitting on the comma would
      // turn one valid stage into two invalid ones.
      params.status = JSON.stringify(statusesToPass);
    }

    const types = new Set([...tableTypeFilters, ...advancedFilters.type]);
    if (types.size > 0) {
      params.loan_type = Array.from(types).join(',');
    }

    // `region`, not `location`: A2C Loan Application has no `location` column, and
    // naming one put a nonexistent column in the WHERE clause — a 500, not a filter.
    //
    // Trimmed because the control is a free-text box matched from the start of the
    // region name: an untrimmed "  " is truthy, so it went to the endpoint as
    // `like '  %'` and emptied the table with no filter chip to explain why.
    const region = advancedFilters.region?.trim();
    if (region) {
      params.region = region;
    }

    if (advancedFilters.minLoan !== null && advancedFilters.minLoan !== undefined) {
      params.min_loan_amount = String(advancedFilters.minLoan);
    }
    if (advancedFilters.maxLoan !== null && advancedFilters.maxLoan !== undefined) {
      params.max_loan_amount = String(advancedFilters.maxLoan);
    }

    if (advancedFilters.sortBy) {
      params.sort_by = advancedFilters.sortBy;
    }
    if (advancedFilters.sortOrder) {
      params.sort_order = advancedFilters.sortOrder;
    }

    return params;
  }
);

export const loanDashboardReducer = loanDashboardSlice.reducer;
