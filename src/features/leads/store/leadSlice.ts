import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { leadService } from '@/features/leads/api/lead.service';
import type { GetLeadsParams, Lead } from '@/features/leads/types/leads.types';

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params: GetLeadsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await leadService.getLeads(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch leads');
    }
  }
);

export const fetchLeadSummary = createAsyncThunk(
  'leads/fetchLeadSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leadService.getLeadSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch lead summary');
    }
  }
);

export interface AdvFilters {
  statuses: string[];
  callStatus: string;
  quickDate: string;
  dateFrom: string;
  dateTo: string;
  phoneNumber: string;
}

interface LeadState {
  selectedLeadIds: string[];
  leads: Lead[];
  isLeadsLoading: boolean;
  leadsError: string | null;
  leadSummary: any | null;
  isSummaryLoading: boolean;
  summaryError: string | null;
  // Filters
  search: string;
  activeTab: string;
  dateFilter: string;
  colStatusFilter: string[];
  colCallTimeFilter: string[];
  advFilters: AdvFilters;
}

const initialFilters: AdvFilters = {
  statuses: [],
  callStatus: 'All',
  quickDate: '',
  dateFrom: '',
  dateTo: '',
  phoneNumber: '',
};

const initialState: LeadState = {
  selectedLeadIds: [],
  leads: [],
  isLeadsLoading: false,
  leadsError: null,
  leadSummary: null,
  isSummaryLoading: false,
  summaryError: null,
  search: '',
  activeTab: 'all',
  dateFilter: 'All Time',
  colStatusFilter: [],
  colCallTimeFilter: [],
  advFilters: initialFilters,
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    toggleLeadSelection(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.selectedLeadIds.indexOf(id);
      if (idx >= 0) {
        state.selectedLeadIds.splice(idx, 1);
      } else {
        state.selectedLeadIds.push(id);
      }
    },
    clearLeadSelection(state) {
      state.selectedLeadIds = [];
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    setDateFilter(state, action: PayloadAction<string>) {
      state.dateFilter = action.payload;
    },
    setColStatusFilter(state, action: PayloadAction<string[]>) {
      state.colStatusFilter = action.payload;
    },
    setColCallTimeFilter(state, action: PayloadAction<string[]>) {
      state.colCallTimeFilter = action.payload;
    },
    setAdvFilters(state, action: PayloadAction<AdvFilters>) {
      state.advFilters = action.payload;
    },
    resetFilters(state) {
      state.search = '';
      state.activeTab = 'all';
      state.dateFilter = 'All Time';
      state.colStatusFilter = [];
      state.colCallTimeFilter = [];
      state.advFilters = initialFilters;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeads
      .addCase(fetchLeads.pending, (state) => {
        state.isLeadsLoading = true;
        state.leadsError = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLeadsLoading = false;
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLeadsLoading = false;
        state.leadsError = action.payload as string;
      })
      // fetchLeadSummary
      .addCase(fetchLeadSummary.pending, (state) => {
        state.isSummaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchLeadSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.leadSummary = action.payload;
      })
      .addCase(fetchLeadSummary.rejected, (state, action) => {
        state.isSummaryLoading = false;
        state.summaryError = action.payload as string;
      });
  },
});

export const {
  toggleLeadSelection,
  clearLeadSelection,
  setSearch,
  setActiveTab,
  setDateFilter,
  setColStatusFilter,
  setColCallTimeFilter,
  setAdvFilters,
  resetFilters,
} = leadSlice.actions;

export const selectSelectedLeadIds = (state: RootState) => state.leads.selectedLeadIds;
export const selectLeads = (state: RootState) => state.leads.leads;
export const selectIsLeadsLoading = (state: RootState) => state.leads.isLeadsLoading;
export const selectLeadsError = (state: RootState) => state.leads.leadsError;
export const selectLeadSummary = (state: RootState) => state.leads.leadSummary;
export const selectIsSummaryLoading = (state: RootState) => state.leads.isSummaryLoading;

export const selectSearch = (state: RootState) => state.leads.search;
export const selectActiveTab = (state: RootState) => state.leads.activeTab;
export const selectDateFilter = (state: RootState) => state.leads.dateFilter;
export const selectColStatusFilter = (state: RootState) => state.leads.colStatusFilter;
export const selectColCallTimeFilter = (state: RootState) => state.leads.colCallTimeFilter;
export const selectAdvFilters = (state: RootState) => state.leads.advFilters;

// ── Memoized Filtering Selector ──

function parseCallDate(callStartTime?: string): Date | null {
  if (!callStartTime) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (callStartTime.startsWith('Today')) return new Date(today);
  if (callStartTime.startsWith('Yesterday')) return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const match = callStartTime.match(/^([A-Za-z]+ \d+)/);
  if (match) return new Date(`${match[1]}, ${today.getFullYear()}`);
  
  // ISO / DB timestamp parsing fallback
  const parsed = new Date(callStartTime);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
}

export const selectFilteredLeads = createSelector(
  [
    selectLeads,
    selectSearch,
    selectActiveTab,
    selectDateFilter,
    selectColStatusFilter,
    selectColCallTimeFilter,
    selectAdvFilters
  ],
  (allLeads, search, activeTab, dateFilter, colStatusFilter, colCallTimeFilter, advFilters) => {
    const myLeads = allLeads.filter((l: any) => l.owner === 'me');
    const unassignedLeads = allLeads.filter((l: any) => l.owner === 'unassigned');
    const baseLeads = activeTab === 'my' ? myLeads : activeTab === 'unassigned' ? unassignedLeads : allLeads;

    const q = search.trim().toLowerCase();
    
    // Toolbar Date filter calculation:
    const daysMap: Record<string, number> = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'Last 90 Days': 90 };
    const filterDays = daysMap[dateFilter] ?? null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = filterDays ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - (filterDays - 1)) : null;

    // Advanced date range or quick date calculation:
    let advStart: Date | null = null;
    let advEnd: Date | null = null;

    if (advFilters.quickDate) {
      const advDaysMap: Record<string, number> = { 'Today': 1, 'Last 7 Days': 7, 'Last 30 Days': 30, 'This Month': 30 };
      const advDays = advDaysMap[advFilters.quickDate] ?? null;
      if (advDays) {
        if (advFilters.quickDate === 'This Month') {
          advStart = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          advStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (advDays - 1));
        }
      }
    } else {
      if (advFilters.dateFrom) advStart = new Date(advFilters.dateFrom);
      if (advFilters.dateTo) advEnd = new Date(advFilters.dateTo);
    }

    return baseLeads.filter((l: any) => {
      // 1. General Search query (Search bar)
      if (q && !`${l.id} ${l.phone} ${l.status} ${l.location}`.toLowerCase().includes(q)) return false;

      // 2. Columns Status Filter (from column header filters)
      if (colStatusFilter.length > 0 && !colStatusFilter.includes(l.status)) return false;

      // 3. Toolbar Date filter
      if (cutoff) {
        const leadDate = parseCallDate(l.callStartTime);
        if (!leadDate || leadDate < cutoff) return false;
      }

      // 4. Columns Call Time Filter (from column header filters)
      if (colCallTimeFilter.length > 0) {
        const leadDate = parseCallDate(l.callStartTime);
        const t = l.callStartTime ?? '';
        const matches = colCallTimeFilter.some(period => {
          if (period === 'Today') return t.startsWith('Today');
          if (period === 'Yesterday') return t.startsWith('Yesterday');
          if (period === 'Last 7 Days') {
            const c = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
            return leadDate != null && leadDate >= c;
          }
          if (period === 'Last 30 Days') {
            const c = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
            return leadDate != null && leadDate >= c;
          }
          if (period === 'Last 90 Days') {
            const c = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89);
            return leadDate != null && leadDate >= c;
          }
          return true;
        });
        if (!matches) return false;
      }

      // ── ADVANCED FILTERS ──

      // A. Statuses
      if (advFilters.statuses.length > 0 && !advFilters.statuses.includes(l.status)) return false;

      // B. Call Status
      if (advFilters.callStatus !== 'All') {
        const d = l.callDuration ?? '';
        if (advFilters.callStatus === 'Missed') {
          if (d.toLowerCase() !== 'missed') return false;
        } else if (advFilters.callStatus === 'Voicemail') {
          if (d.toLowerCase() !== 'voicemail') return false;
        } else if (advFilters.callStatus === 'Completed') {
          if (d.toLowerCase() === 'missed' || d.toLowerCase() === 'voicemail') return false;
        }
      }

      // C. Date Range
      if (advStart || advEnd) {
        const leadDate = parseCallDate(l.callStartTime);
        if (!leadDate) return false;
        if (advStart && leadDate < advStart) return false;
        if (advEnd && leadDate > advEnd) return false;
      }

      // D. Phone Number
      if (advFilters.phoneNumber.trim()) {
        const cleanPhone = advFilters.phoneNumber.replace(/\D/g, '');
        const cleanLeadPhone = l.phone.replace(/\D/g, '');
        if (cleanPhone && !cleanLeadPhone.includes(cleanPhone)) return false;
      }

      return true;
    });
  }
);

export default leadSlice.reducer;
