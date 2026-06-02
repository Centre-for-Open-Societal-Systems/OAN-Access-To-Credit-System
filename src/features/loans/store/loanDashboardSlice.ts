import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { loanService, GetLoansParams } from '@/features/loans/api/loan.service';
import { PAGE_SIZE } from '@/features/loans/constants/loans.constants';

export const fetchLoans = createAsyncThunk(
  'loanDashboard/fetchLoans',
  async (params: GetLoansParams | undefined, { rejectWithValue }) => {
    try {
      const response = await loanService.getLoans(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch loans');
    }
  }
);

export const fetchLoanSummary = createAsyncThunk(
  'loanDashboard/fetchLoanSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loanService.getLoanSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch loan summary');
    }
  }
);

const ALL_STATUS_VALUES = ['danger', 'info', 'neutral'];

interface LoanDashboardState {
  rawActivityData: any;
  isLoading: boolean;
  loansError: string | null;
  rawSummaryData: any;
  isSummaryLoading: boolean;
  summaryError: string | null;
  
  // UI State
  dateRange: string;
  selectedStatuses: string[];
  activityPage: number;
}

const initialState: LoanDashboardState = {
  rawActivityData: null,
  isLoading: false,
  loansError: null,
  rawSummaryData: null,
  isSummaryLoading: false,
  summaryError: null,
  
  dateRange: 'last30',
  selectedStatuses: [...ALL_STATUS_VALUES],
  activityPage: 1,
};

const loanDashboardSlice = createSlice({
  name: 'loanDashboard',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<string>) => {
      state.dateRange = action.payload;
    },
    toggleStatus: (state, action: PayloadAction<string>) => {
      const value = action.payload;
      const index = state.selectedStatuses.indexOf(value);
      if (index > -1) {
        state.selectedStatuses.splice(index, 1);
      } else {
        state.selectedStatuses.push(value);
      }
      if (state.selectedStatuses.length === 0) {
        state.selectedStatuses = [...ALL_STATUS_VALUES];
      }
      state.activityPage = 1;
    },
    toggleAllStatuses: (state) => {
      if (state.selectedStatuses.length === ALL_STATUS_VALUES.length) {
        state.selectedStatuses = [];
      } else {
        state.selectedStatuses = [...ALL_STATUS_VALUES];
      }
      state.activityPage = 1;
    },
    setActivityPage: (state, action: PayloadAction<number>) => {
      state.activityPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchLoans
      .addCase(fetchLoans.pending, (state) => {
        state.isLoading = true;
        state.loansError = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rawActivityData = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.loansError = action.payload as string;
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

export const { setDateRange, toggleStatus, toggleAllStatuses, setActivityPage } = loanDashboardSlice.actions;

// --- Basic Selectors ---
export const selectRawActivityData = (state: RootState) => state.loanDashboard.rawActivityData;
export const selectIsLoansLoading = (state: RootState) => state.loanDashboard.isLoading;
export const selectRawSummaryData = (state: RootState) => state.loanDashboard.rawSummaryData;
export const selectDateRange = (state: RootState) => state.loanDashboard.dateRange;
export const selectSelectedStatuses = (state: RootState) => state.loanDashboard.selectedStatuses;
export const selectActivityPage = (state: RootState) => state.loanDashboard.activityPage;

// --- Derived Memoized Selectors ---
export const selectPagedRowsData = createSelector(
  [selectRawActivityData],
  (rawActivityData) => {
    let rows = rawActivityData?.message?.results || rawActivityData?.message || rawActivityData?.data || rawActivityData || [];
    if (!Array.isArray(rows)) {
      rows = Array.isArray(rows.results) ? rows.results :
        Array.isArray(rows.data) ? rows.data :
          (Array.isArray(rows.applications) ? rows.applications : []);
    }

    let total = rawActivityData?.message?.total_count || rawActivityData?.total_count || rawActivityData?.total || 0;

    const mapped = rows.map((row: any) => {
      const rawDate = row.creation ? new Date(row.creation) : new Date();
      const dateStr = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return {
        ...row,
        id: row.id || row.name || 'UNKNOWN',
        applicant: row.applicant || row.farmer || row.full_name || 'Unknown Applicant',
        type: row.type || row.loan_type || 'Unknown Type',
        status: row.status || 'Draft',
        statusTone: row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'danger' : row.status === 'Draft' ? 'neutral' : 'info',
        updated: row.updated || `${dateStr} · ${timeStr}`,
        timestamp: row.timestamp || rawDate.getTime(),
        action: row.action || 'View',
      };
    });

    if (total === 0 && mapped.length > 0) {
      total = mapped.length;
    }

    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    return { pagedRows: mapped, totalPages };
  }
);

export const selectPagedRows = createSelector([selectPagedRowsData], (data) => data.pagedRows);
export const selectTotalPages = createSelector([selectPagedRowsData], (data) => data.totalPages);

export const selectLiveMetrics = createSelector(
  [selectRawSummaryData],
  (rawSummaryData) => {
    const summaryData = rawSummaryData?.message || rawSummaryData?.data || rawSummaryData || {};
    const defaultMetric = { value: '0', trend: '0%', dir: 'up' as const };

    return {
      total: {
        value: summaryData.total?.toString() || defaultMetric.value,
        trend: defaultMetric.trend,
        dir: defaultMetric.dir
      },
      approved: {
        value: (summaryData.approved ?? summaryData.Approved)?.toString() || defaultMetric.value,
        trend: defaultMetric.trend,
        dir: defaultMetric.dir
      },
      pending: {
        value: (summaryData.pending ?? summaryData['Pending Review'] ?? summaryData.Draft)?.toString() || defaultMetric.value,
        trend: defaultMetric.trend,
        dir: defaultMetric.dir
      },
      rejected: {
        value: (summaryData.rejected ?? summaryData.Rejected)?.toString() || defaultMetric.value,
        trend: defaultMetric.trend,
        dir: defaultMetric.dir
      },
    };
  }
);

export const selectVisibleNotifications = createSelector(
  [selectDateRange],
  (dateRange) => {
    // Mock notifications data (currently empty)
    const allNotifications: any[] = [];

    const getCutoffTimestamp = (range: string) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
      const resolvers: Record<string, () => number> = {
        'today': () => today,
        'yesterday': () => today - 86400000,
        'last7': () => today - 6 * 86400000,
        'last30': () => today - 29 * 86400000,
        'last3m': () => new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime(),
        'last6m': () => new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime(),
        'last1y': () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime(),
      };
      return resolvers[range]?.() ?? 0;
    };
    
    const cutoffTimestamp = getCutoffTimestamp(dateRange);

    const parseNotificationTime = (timeStr: string) => {
      const cleanTime = timeStr.replace(' · ', ' ');
      return new Date(cleanTime).getTime() || 0;
    };

    return allNotifications.filter(
      (n) => parseNotificationTime(n.time) >= cutoffTimestamp
    );
  }
);

export const selectQueryParams = createSelector(
  [selectActivityPage, selectDateRange, selectSelectedStatuses],
  (activityPage, dateRange, selectedStatuses) => {
    const params: Record<string, any> = {
      page: activityPage,
      page_size: PAGE_SIZE,
    };

    const getCutoffTimestamp = (range: string) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
      const resolvers: Record<string, () => number> = {
        'today': () => today,
        'yesterday': () => today - 86400000,
        'last7': () => today - 6 * 86400000,
        'last30': () => today - 29 * 86400000,
        'last3m': () => new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime(),
        'last6m': () => new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime(),
        'last1y': () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime(),
      };
      return resolvers[range]?.() ?? 0;
    };
    
    const ts = getCutoffTimestamp(dateRange);
    if (ts > 0) {
      const d = new Date(ts);
      params.from_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    const allChecked = selectedStatuses.length === ALL_STATUS_VALUES.length;
    if (!allChecked && selectedStatuses.length > 0) {
      const statuses = [];
      if (selectedStatuses.includes('danger')) statuses.push('Rejected');
      if (selectedStatuses.includes('neutral')) statuses.push('Draft');
      if (selectedStatuses.includes('info')) statuses.push('Pending Review');
      if (statuses.length > 0) {
        params.status = JSON.stringify(statuses);
      }
    } else if (selectedStatuses.length === 0) {
      params.status = JSON.stringify(['__NONE__']);
    }

    return params;
  }
);

export default loanDashboardSlice.reducer;
