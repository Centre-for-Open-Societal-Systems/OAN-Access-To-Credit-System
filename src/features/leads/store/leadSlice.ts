import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { leadService } from '@/features/leads/api/lead.service';
import type { GetLeadsParams, Lead, LeadSummaryResponse } from '@/features/leads/types/leads.types';

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
  quickDate: string;
  dateFrom: string;
  dateTo: string;
  location: string;
  minAmount: number | null;
  maxAmount: number | null;
  loanType: string[];
  leadSources: string[];
}

interface LeadState {
  selectedLeadIds: string[];
  leads: Lead[];
  totalCount: number;
  isLeadsLoading: boolean;
  leadsError: string | null;
  leadSummary: LeadSummaryResponse | null;
  isSummaryLoading: boolean;
  summaryError: string | null;
  // Filters
  search: string;
  activeTab: string;
  dateFilter: string;
  advFilters: AdvFilters;
}

const initialFilters: AdvFilters = {
  statuses: [],
  quickDate: '',
  dateFrom: '',
  dateTo: '',
  location: '',
  minAmount: null,
  maxAmount: null,
  loanType: [],
  leadSources: [],
};

const initialState: LeadState = {
  selectedLeadIds: [],
  leads: [],
  totalCount: 0,
  isLeadsLoading: false,
  leadsError: null,
  leadSummary: null,
  isSummaryLoading: false,
  summaryError: null,
  search: '',
  activeTab: 'all',
  dateFilter: 'All Time',
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
      state.advFilters.statuses = action.payload;
    },
    setColCallTimeFilter(state, action: PayloadAction<string[]>) {
      state.advFilters.loanType = action.payload;
    },
    setAdvFilters(state, action: PayloadAction<AdvFilters>) {
      state.advFilters = action.payload;
    },
    resetFilters(state) {
      state.search = '';
      state.activeTab = 'all';
      state.dateFilter = 'All Time';
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
        state.leads = action.payload.results;
        state.totalCount = action.payload.totalCount;
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
      })
      // Sync status with details view to avoid stale state / UI flashes
      .addMatcher(
        (action) => action.type === 'newLead/updateLeadStatus/fulfilled',
        (state, action: any) => {
          const { leadId, status } = action.payload.payload;
          const lead = state.leads.find(l => l.id.replace('#', '') === leadId.replace('#', ''));
          if (lead) {
            lead.status = status;
          }
        }
      )
      .addMatcher(
        (action) => action.type === 'newLead/updateVisitScheduleStatus/fulfilled',
        (state, action: any) => {
          const { leadId, status } = action.payload.payload;
          if (status === 'Completed') {
            const lead = state.leads.find(l => l.id.replace('#', '') === leadId.replace('#', ''));
            if (lead) {
              lead.visitDate = undefined;
            }
          }
        }
      )
      .addMatcher(
        (action) => action.type === 'newLead/fetchLeadDetails/fulfilled',
        (state, action: any) => {
          const leadId = action.meta.arg;
          const leadData = action.payload?.data;
          if (leadData) {
            const lead = state.leads.find(l => l.id.replace('#', '') === leadId.replace('#', ''));
            if (lead) {
              lead.status = leadData.status;
              lead.name = `${leadData.first_name} ${leadData.last_name}`;
              lead.farmerPhone = leadData.phone_number;
              lead.location = leadData.location;
            }
          }
        }
      );
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
export const selectTotalCount = (state: RootState) => state.leads.totalCount;
export const selectIsLeadsLoading = (state: RootState) => state.leads.isLeadsLoading;
export const selectLeadsError = (state: RootState) => state.leads.leadsError;
export const selectLeadSummary = (state: RootState) => state.leads.leadSummary;
export const selectIsSummaryLoading = (state: RootState) => state.leads.isSummaryLoading;

export const selectSearch = (state: RootState) => state.leads.search;
export const selectActiveTab = (state: RootState) => state.leads.activeTab;
export const selectDateFilter = (state: RootState) => state.leads.dateFilter;
export const selectColStatusFilter = (state: RootState) => state.leads.advFilters.statuses;
export const selectColCallTimeFilter = (state: RootState) => state.leads.advFilters.loanType;
export const selectAdvFilters = (state: RootState) => state.leads.advFilters;

// ── Backend Filter Pass-Through ──

export const selectFilteredLeads = (state: RootState) => state.leads.leads;


export default leadSlice.reducer;
