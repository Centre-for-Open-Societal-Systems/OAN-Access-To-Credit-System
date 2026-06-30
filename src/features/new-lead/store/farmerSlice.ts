import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService, FarmerDetails } from '../api/newLead.service';
import type { RootState } from '@/store';
import { initializeLead, clearForm } from './actions';
import { logger } from '@/lib/logger';
export type { FarmerDetails };

interface FarmerState {
  farmerId: string;
  farmerDetails: FarmerDetails;
  isSearchingFarmer: boolean;
  searchedFarmer: FarmerDetails | null;
  searchError: string | null;
  // Error from fetching a specific lead's details (e.g. 'FORBIDDEN' on a 403).
  detailsError: string | null;
  isPollingLong: boolean;
}

export const createDefaultFarmerDetails = (partial?: Partial<FarmerDetails>): FarmerDetails => ({
  firstName: partial?.firstName ?? '',
  lastName: partial?.lastName ?? '',
  location: partial?.location ?? '',
  phoneNumber: partial?.phoneNumber ?? '',
  email: partial?.email ?? '',
  gender: partial?.gender ?? '',
});

const initialState: FarmerState = {
  farmerId: '',
  farmerDetails: createDefaultFarmerDetails(),
  isSearchingFarmer: false,
  searchedFarmer: null,
  searchError: null,
  detailsError: null,
  isPollingLong: false,
};


export const searchFarmerThunk = createAsyncThunk<FarmerDetails, string>(
  'farmer/searchFarmer',
  async (faydaId: string, { rejectWithValue }) => {
    try {
      return await newLeadService.searchFarmer(faydaId);
    } catch (error) {
      const err = error as Error & { responseData?: { exc_type?: string } };
      if (err.responseData?.exc_type === 'DoesNotExistError') {
        return rejectWithValue(`Farmer with Fayda ID '${faydaId}' not found.`);
      }
      return rejectWithValue(err.message ?? 'Unknown Cause: Farmer search failed.');
    }
  }
);

export const fetchLeadDetailsThunk = createAsyncThunk<
  FarmerDetails,
  string | { leadId: string; shouldPoll?: boolean },
  { state: RootState }
>(
  'farmer/fetchLeadDetails',
  async (arg, { dispatch, rejectWithValue }) => {
    const leadId = typeof arg === 'string' ? arg : arg.leadId;
    let shouldPoll = typeof arg === 'string' ? false : (arg.shouldPoll ?? false);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    let maxRetries = shouldPoll ? 24 : 1; 
    let retries = 0;

    let timeoutId: NodeJS.Timeout | undefined;
    if (shouldPoll) {
      timeoutId = setTimeout(() => {
        dispatch(setIsPollingLong(true));
      }, 2000);
    }

    try {
      while (retries < maxRetries) {
        try {
          const response = await newLeadService.getLeadDetails(leadId);
          
          // The backend specifically indicates a background demographic sync is in progress
          // when the status is 'Pending OTP' but 'otp_verified' is true.
          const isSyncInProgress = response.consent_request_status === 'Pending OTP' && response.consent_request_otp_verified === true;
          
          if (isSyncInProgress && !shouldPoll) {
            shouldPoll = true;
            maxRetries = 24; // dynamically enable polling
            if (!timeoutId) {
              timeoutId = setTimeout(() => {
                dispatch(setIsPollingLong(true));
              }, 2000);
            }
          }

          // Data has arrived if farmer_profile_created is true
          const dataArrived = response && response.farmer_profile_created === true;
          
          if (dataArrived || !shouldPoll) {
            return response;
          }
          
          logger.log(`Lead details not yet ready for leadId: ${leadId}. Retrying in 5 seconds... (Attempt ${retries + 1}/${maxRetries})`);
        } catch (error) {
          const message = error instanceof Error ? error.message : '';
          // Permission/session errors won't resolve by retrying — bail out
          // immediately so a 403 surfaces as not-found and a 401 logs out.
          if (message === 'FORBIDDEN' || message === 'UNAUTHORIZED') {
            return rejectWithValue(message);
          }
          if (!shouldPoll) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch lead details');
          }
          logger.warn(`Failed to fetch lead details for leadId: ${leadId}. Error: ${error instanceof Error ? error.message : String(error)}. Retrying in 5 seconds... (Attempt ${retries + 1}/${maxRetries})`);
        }
        
        retries++;
        if (retries < maxRetries) {
          await delay(5000);
        }
      }
      
      // Final attempt before rejecting
      try {
        return await newLeadService.getLeadDetails(leadId);
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch lead details after retries');
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      dispatch(setIsPollingLong(false));
    }
  }
);

const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    setFarmerId(state, action: PayloadAction<string>) {
      state.farmerId = action.payload;
      state.searchedFarmer = null;
      state.searchError = null;
    },
    updateFarmerDetails(state, action: PayloadAction<Partial<FarmerDetails>>) {
      state.farmerDetails = { ...state.farmerDetails, ...action.payload };
    },
    setIsPollingLong(state, action: PayloadAction<boolean>) {
      state.isPollingLong = action.payload;
    },
    clearFarmerState() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFarmerThunk.pending, (state) => {
        state.isSearchingFarmer = true;
        state.searchedFarmer = null;
        state.searchError = null;
      })
      .addCase(searchFarmerThunk.fulfilled, (state, action) => {
        state.isSearchingFarmer = false;
        state.searchedFarmer = action.payload;
        state.searchError = null;
      })
      .addCase(searchFarmerThunk.rejected, (state, action) => {
        state.isSearchingFarmer = false;
        state.searchedFarmer = null;
        state.searchError = (action.payload as string) ?? action.error.message ?? ' Unkown Reason: Farmer search failed.';
      })
      .addCase(fetchLeadDetailsThunk.pending, (state) => {
        state.detailsError = null;
      })
      .addCase(fetchLeadDetailsThunk.fulfilled, (state, action) => {
        state.farmerDetails = action.payload;
        state.detailsError = null;
      })
      .addCase(fetchLeadDetailsThunk.rejected, (state, action) => {
        state.detailsError = (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(initializeLead, (state, action) => {
        const payload = action.payload ?? {};
        state.farmerId = payload.farmerId ?? '';
        state.farmerDetails = createDefaultFarmerDetails(payload.farmerDetails);
        state.searchedFarmer = null;
        state.isSearchingFarmer = false;
        state.searchError = null;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { setFarmerId, updateFarmerDetails, clearFarmerState, setIsPollingLong } = farmerSlice.actions;

export const selectFarmerState = (state: RootState) => state.farmer;
export const selectSearchError = (state: RootState) => state.farmer.searchError;
export const selectDetailsError = (state: RootState) => state.farmer.detailsError;
export const selectIsPollingLong = (state: RootState) => state.farmer.isPollingLong;

export const farmerReducer = farmerSlice.reducer;
