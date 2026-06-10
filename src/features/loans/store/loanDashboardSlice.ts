import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { loanService, GetLoansParams } from '@/features/loans/api/loan.service';
import { PAGE_SIZE } from '@/features/loans/constants/loans.constants';
import { getFallbackMockRows } from '@/mocks/loans.mock';

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

export const updateLoanStatus = createAsyncThunk(
  'loanDashboard/updateLoanStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await loanService.updateLoanStatus(id, status);
      // Re-fetch loans after a successful update to refresh the list
      dispatch(fetchLoans());
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update loan status');
    }
  }
);

const ALL_STATUS_VALUES = ['danger', 'info', 'neutral'];

export interface AdvancedFilters {
  status: string[];
  minLoan: number | null;
  maxLoan: number | null;
  type: string[];
  location: string;
  dateFrom: string;
  dateTo: string;
}

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
  activeTab: 'all' | 'my' | 'unassigned';
  searchQuery: string;
  tableStatusFilters: string[];
  tableTypeFilters: string[];
  pageSize: number;
  advancedFilters: AdvancedFilters;
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
  activeTab: 'all',
  searchQuery: '',
  tableStatusFilters: [],
  tableTypeFilters: [],
  pageSize: 10,
  advancedFilters: {
    status: [],
    minLoan: null,
    maxLoan: null,
    type: [],
    location: '',
    dateFrom: '',
    dateTo: '',
  }
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
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.activityPage = 1; // reset to page 1
    },
    setAdvancedFilters: (state, action: PayloadAction<AdvancedFilters>) => {
      state.advancedFilters = action.payload;
      state.activityPage = 1;
    },
    clearAdvancedFilters: (state) => {
      state.advancedFilters = {
        status: [],
        minLoan: null,
        maxLoan: null,
        type: [],
        location: '',
        dateFrom: '',
        dateTo: '',
      };
      state.activityPage = 1;
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

export const { 
  setDateRange, 
  toggleStatus, 
  toggleAllStatuses, 
  setActivityPage, 
  setActiveTab, 
  setSearchQuery,
  toggleTableStatusFilter,
  toggleTableTypeFilter,
  clearTableFilters,
  setPageSize,
  setAdvancedFilters,
  clearAdvancedFilters
} = loanDashboardSlice.actions;

// --- Basic Selectors ---
export const selectRawActivityData = (state: RootState) => state.loanDashboard.rawActivityData;
export const selectIsLoansLoading = (state: RootState) => state.loanDashboard.isLoading;
export const selectRawSummaryData = (state: RootState) => state.loanDashboard.rawSummaryData;
export const selectDateRange = (state: RootState) => state.loanDashboard.dateRange;
export const selectSelectedStatuses = (state: RootState) => state.loanDashboard.selectedStatuses;
export const selectActivityPage = (state: RootState) => state.loanDashboard.activityPage;
export const selectActiveTab = (state: RootState) => state.loanDashboard.activeTab;
export const selectSearchQuery = (state: RootState) => state.loanDashboard.searchQuery;
export const selectTableStatusFilters = (state: RootState) => state.loanDashboard.tableStatusFilters;
export const selectTableTypeFilters = (state: RootState) => state.loanDashboard.tableTypeFilters;
export const selectPageSize = (state: RootState) => state.loanDashboard.pageSize;
export const selectAdvancedFilters = (state: RootState) => state.loanDashboard.advancedFilters;

// --- Derived Memoized Selectors ---
export const selectPagedRowsData = createSelector(
  [selectRawActivityData, selectPageSize],
  (rawActivityData, pageSize) => {
    // fetchApi automatically unwraps the "message" envelope, so the data is directly on rawActivityData
    let rows = rawActivityData?.results || [];
    
    let totalCount = rawActivityData?.total || 0;

    const mapped = rows.map((row: any) => {
      const rawDate = row.creation ? new Date(row.creation) : new Date();
      const dateStr = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const appId = row.application_id || '';
      const formattedId = appId.startsWith('#AGL-') ? appId : `#AGL-${appId.replace(/\D/g, '').slice(-4) || '9823'}`;

      const firstName = row.first_name || '';
      const lastName = row.last_name || '';
      const applicantName = `${firstName} ${lastName}`.trim();

      return {
        ...row,
        id: formattedId,
        applicant: applicantName,
        phone: row.phone_number || '',
        loanAmount: row.loan_amount ? `ETB ${row.loan_amount.toLocaleString()}` : '—',
        type: row.loan_type || 'Unknown Type',
        status: row.status || 'Draft',
        statusTone: row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'danger' : row.status === 'Draft' ? 'neutral' : 'info',
        updated: `${dateStr} · ${timeStr}`,
        timestamp: rawDate.getTime(),
        action: 'View',
      };
    });

    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    return { pagedRows: mapped, totalPages, totalCount };
  }
);

export const selectPagedRows = createSelector([selectPagedRowsData], (data) => data.pagedRows);
export const selectTotalPages = createSelector([selectPagedRowsData], (data) => data.totalPages);
export const selectTotalCount = createSelector([selectPagedRowsData], (data) => data.totalCount);

export const selectLiveMetrics = createSelector(
  [selectRawSummaryData],
  (rawSummaryData) => {
    // fetchApi automatically unwraps the "message" envelope
    const summaryData = rawSummaryData?.summary || {};

    return {
      total: {
        value: summaryData.total?.toString() || '—',
      },
      processing: {
        value: summaryData.processing?.toString() || '—',
      },
      approved: {
        value: summaryData.approved?.toString() || '—',
      },
      rejected: {
        value: summaryData.rejected?.toString() || '—',
      },
    };
  }
);

export const selectTabCounts = createSelector(
  [selectRawSummaryData],
  (rawSummaryData) => {
    return rawSummaryData?.summary?.tab_counts || { all: 0, my: 0, unassigned: 0 };
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
  [selectActivityPage, selectPageSize, selectDateRange, selectSelectedStatuses, selectSearchQuery, selectActiveTab, selectTableStatusFilters, selectTableTypeFilters, selectAdvancedFilters],
  (activityPage, pageSize, dateRange, selectedStatuses, searchQuery, activeTab, tableStatusFilters, tableTypeFilters, advancedFilters) => {
    const params: Record<string, any> = {
      page: activityPage,
      page_size: pageSize,
    };

    if (searchQuery) params.search_query = searchQuery;
    if (activeTab && activeTab !== 'all') params.tab = activeTab;

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

    if (advancedFilters.dateFrom) params.from_date = advancedFilters.dateFrom.split('T')[0];
    if (advancedFilters.dateTo) params.to_date = advancedFilters.dateTo.split('T')[0];

    const allChecked = selectedStatuses.length === ALL_STATUS_VALUES.length;
    let statusesToPass: string[] = [];
    
    if (!allChecked && selectedStatuses.length > 0) {
      if (selectedStatuses.includes('danger')) statusesToPass.push('Rejected', 'Action Required');
      if (selectedStatuses.includes('neutral')) statusesToPass.push('Draft');
      if (selectedStatuses.includes('info')) statusesToPass.push('Pending Review', 'Processing');
      if (selectedStatuses.includes('success')) statusesToPass.push('Approved');
    }

    // Combine with table status filters
    if (tableStatusFilters.length > 0) {
      statusesToPass = [...new Set([...statusesToPass, ...tableStatusFilters])];
    }
    
    // Combine with advanced status filters
    if (advancedFilters.status.length > 0) {
      statusesToPass = [...new Set([...statusesToPass, ...advancedFilters.status])];
    }

    if (statusesToPass.length > 0) {
      params.status = statusesToPass.join(',');
    } else if (selectedStatuses.length === 0 && tableStatusFilters.length === 0 && advancedFilters.status.length === 0) {
      params.status = '__NONE__';
    }

    let typesToPass = [...tableTypeFilters];
    if (advancedFilters.type.length > 0) {
      typesToPass = [...new Set([...typesToPass, ...advancedFilters.type])];
    }
    if (typesToPass.length > 0) {
      params.loan_type = typesToPass.join(',');
    }

    if (advancedFilters.location) {
      params.location = advancedFilters.location;
    }

    if (advancedFilters.minLoan !== null && advancedFilters.minLoan !== undefined) {
      params.loan_amount_min = String(advancedFilters.minLoan);
    }
    if (advancedFilters.maxLoan !== null && advancedFilters.maxLoan !== undefined) {
      params.loan_amount_max = String(advancedFilters.maxLoan);
    }

    return params;
  }
);

export default loanDashboardSlice.reducer;
