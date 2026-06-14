import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService, FarmerDetails } from '../api/newLead.service';
import type { RootState } from '@/store';
import { initializeLead, clearForm } from './actions';
export type { FarmerDetails };

interface FarmerState {
  farmerId: string;
  farmerDetails: FarmerDetails;
  isSearchingFarmer: boolean;
  searchedFarmer: FarmerDetails | null;
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

export const fetchLeadDetailsThunk = createAsyncThunk<FarmerDetails, string>(
  'farmer/fetchLeadDetails',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getLeadDetails(leadId);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch lead details');
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
    },
    updateFarmerDetails(state, action: PayloadAction<Partial<FarmerDetails>>) {
      state.farmerDetails = { ...state.farmerDetails, ...action.payload };
    },
    clearFarmerState(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFarmerThunk.pending, (state) => {
        state.isSearchingFarmer = true;
        state.searchedFarmer = null;
      })
      .addCase(searchFarmerThunk.fulfilled, (state, action) => {
        state.isSearchingFarmer = false;
        state.searchedFarmer = action.payload;
      })
      .addCase(searchFarmerThunk.rejected, (state) => {
        state.isSearchingFarmer = false;
        state.searchedFarmer = null;
      })
      .addCase(fetchLeadDetailsThunk.fulfilled, (state, action) => {
        state.farmerDetails = action.payload;
      })

      .addCase(initializeLead, (state, action) => {
        const payload = action.payload ?? {};
        state.farmerId = payload.farmerId ?? '';
        state.farmerDetails = createDefaultFarmerDetails(payload.farmerDetails);
        state.searchedFarmer = null;
        state.isSearchingFarmer = false;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { setFarmerId, updateFarmerDetails, clearFarmerState } = farmerSlice.actions;

export const selectFarmerState = (state: RootState) => state.farmer;

export default farmerSlice.reducer;
