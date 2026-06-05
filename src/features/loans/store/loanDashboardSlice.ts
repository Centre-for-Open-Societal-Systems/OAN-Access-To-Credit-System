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
  amountRange: string;
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
    amountRange: '',
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
        amountRange: '',
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
  [selectRawActivityData, selectActiveTab, selectActivityPage, selectPageSize, selectSearchQuery, selectTableStatusFilters, selectTableTypeFilters, selectAdvancedFilters],
  (rawActivityData, activeTab, activityPage, pageSize, searchQuery, tableStatusFilters, tableTypeFilters, advancedFilters) => {
    let rows = rawActivityData?.message?.results || rawActivityData?.message || rawActivityData?.data || rawActivityData || [];
    if (!Array.isArray(rows)) {
      rows = Array.isArray(rows.results) ? rows.results :
        Array.isArray(rows.data) ? rows.data :
          (Array.isArray(rows.applications) ? rows.applications : []);
    }

    let total = rawActivityData?.message?.total_count || rawActivityData?.total_count || rawActivityData?.total || 0;

    const baseFallbackRows = [
      { id: '#AGL-9823', applicant: 'Adama', phone: '+251 (555) 222-3333', status: 'Approved', type: 'Input loan (seeds, agrochemicals)', loanAmount: 'ETB 1,50,000', updated: 'May 28, 2026 · 09:15 AM' },
      { id: '#AGL-9822', applicant: 'Bishoftu', phone: '+251 (555) 343-11111', status: 'Processing', type: 'Agricultural term loan', loanAmount: 'ETB 1,45,000', updated: 'May 27, 2026 · 16:30 PM' },
      { id: '#AGL-9821', applicant: 'Mekelle', phone: '+251 (555) 231-3221', status: 'Processing', type: 'Land loan', loanAmount: 'ETB 1,80,000', updated: 'May 27, 2026 · 14:20 PM' },
      { id: '#AGL-9820', applicant: 'Dire Dawa', phone: '+251 (555) 231-0198', status: 'Rejected', type: 'Farm equipment loan', loanAmount: 'ETB 1,75,000', updated: 'May 27, 2026 · 11:05 AM' },
      { id: '#AGL-9819', applicant: 'Harar', phone: '+251 (555) 231-7890', status: 'Approved', type: 'Smallholder farmer direct loan', loanAmount: 'ETB 1,70,000', updated: 'May 27, 2026 · 09:30 AM' },
    ];
    
    // Duplicate heavily to ensure we have enough for 15 items and pagination mock
    let fallbackMockRows: any[] = [];
    for (let i = 0; i < 20; i++) {
      fallbackMockRows = [...fallbackMockRows, ...baseFallbackRows.map(r => ({ ...r, id: r.id + `-${i}` }))];
    }

    let fullData = rows.length > 0 ? rows : fallbackMockRows;
    
    // Apply search filtering locally (for mock)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      fullData = fullData.filter((r: any) => 
        (r.id && r.id.toLowerCase().includes(q)) || 
        (r.phone && r.phone.toLowerCase().includes(q)) || 
        (r.applicant && r.applicant.toLowerCase().includes(q))
      );
    }

    // Apply column filters
    if (tableStatusFilters.length > 0) {
      fullData = fullData.filter((r: any) => tableStatusFilters.includes(r.status));
    }
    if (tableTypeFilters.length > 0) {
      fullData = fullData.filter((r: any) => tableTypeFilters.includes(r.type));
    }

    // Apply Advanced Filters
    if (advancedFilters.status.length > 0) {
      fullData = fullData.filter((r: any) => advancedFilters.status.includes(r.status));
    }
    if (advancedFilters.type && advancedFilters.type.length > 0) {
      fullData = fullData.filter((r: any) => advancedFilters.type.includes(r.type));
    }
    if (advancedFilters.location.trim()) {
      const locQ = advancedFilters.location.toLowerCase();
      fullData = fullData.filter((r: any) => 
        (r.applicant && r.applicant.toLowerCase().includes(locQ)) ||
        (r.region && r.region.toLowerCase().includes(locQ))
      );
    }
    if (advancedFilters.amountRange) {
      fullData = fullData.filter((r: any) => {
        if (!r.loanAmount) return false;
        const numVal = parseInt(r.loanAmount.replace(/[^0-9]/g, ''), 10);
        if (advancedFilters.amountRange === '0-25000') return numVal >= 0 && numVal <= 25000;
        if (advancedFilters.amountRange === '25001-50000') return numVal >= 25001 && numVal <= 50000;
        if (advancedFilters.amountRange === '50001-100000') return numVal >= 50001 && numVal <= 100000;
        if (advancedFilters.amountRange === '100000+') return numVal > 100000;
        return true;
      });
    }
    if (advancedFilters.dateFrom || advancedFilters.dateTo) {
      const fromTime = advancedFilters.dateFrom ? new Date(advancedFilters.dateFrom).getTime() : 0;
      const toTime = advancedFilters.dateTo ? new Date(advancedFilters.dateTo).setHours(23, 59, 59, 999) : Infinity;
      
      fullData = fullData.filter((r: any) => {
        const dStr = r.updated ? r.updated.split(' · ')[0] : null; // e.g. "May 28, 2026"
        if (!dStr) return false;
        const rTime = new Date(dStr).getTime();
        return rTime >= fromTime && rTime <= toTime;
      });
    }
    
    // Apply tab filtering
    if (activeTab === 'my') {
      fullData = fullData.slice(0, 12);
      total = fullData.length;
    } else if (activeTab === 'unassigned') {
      fullData = fullData.slice(0, 15);
      total = fullData.length;
    } else {
      // 'all'
      if (rows.length === 0) {
        total = searchQuery.trim() !== '' ? fullData.length : 12493; // Keep big total for "all" mock unless searching
      }
    }

    // Apply mock pagination locally if no real rows
    const startIndex = (activityPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const dataToMap = rows.length > 0 ? fullData.slice(startIndex, endIndex) : fullData.slice(startIndex, endIndex);

    const mapped = dataToMap.map((row: any) => {
      const rawDate = row.creation ? new Date(row.creation) : new Date();
      const dateStr = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Mock Application ID starting with #AGL- if not present
      const appId = row.id || row.name || '9823';
      const formattedId = appId.startsWith('#AGL-') ? appId : `#AGL-${appId.replace(/\D/g, '').slice(-4) || '9823'}`;

      return {
        ...row,
        id: formattedId,
        applicant: row.applicant || row.farmer || row.full_name || 'Unknown Applicant',
        phone: row.phone || '+251 (555) 222-3333',
        loanAmount: row.loanAmount || row.loan_amount || 'ETB 1,50,000',
        type: row.type || row.loan_type || 'Unknown Type',
        status: row.status || 'Draft',
        statusTone: row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'danger' : row.status === 'Draft' ? 'neutral' : 'info',
        updated: row.updated || `${dateStr} · ${timeStr}`,
        timestamp: row.timestamp || rawDate.getTime(),
        action: row.action || 'View',
      };
    });

    const totalPages = Math.ceil(total / pageSize) || 1;
    return { pagedRows: mapped, totalPages, totalCount: total };
  }
);

export const selectPagedRows = createSelector([selectPagedRowsData], (data) => data.pagedRows);
export const selectTotalPages = createSelector([selectPagedRowsData], (data) => data.totalPages);
export const selectTotalCount = createSelector([selectPagedRowsData], (data) => data.totalCount);

export const selectLiveMetrics = createSelector(
  [selectRawSummaryData],
  (rawSummaryData) => {
    const summaryData = rawSummaryData?.message || rawSummaryData?.data || rawSummaryData || {};

    return {
      total: {
        value: summaryData.total?.toString() || '151',
      },
      processing: {
        value: (summaryData.processing ?? summaryData.pending)?.toString() || '30',
      },
      approved: {
        value: (summaryData.approved ?? summaryData.Approved)?.toString() || '10',
      },
      rejected: {
        value: (summaryData.rejected ?? summaryData.Rejected)?.toString() || '5',
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
  [selectActivityPage, selectPageSize, selectDateRange, selectSelectedStatuses],
  (activityPage, pageSize, dateRange, selectedStatuses) => {
    const params: Record<string, any> = {
      page: activityPage,
      page_size: pageSize,
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
