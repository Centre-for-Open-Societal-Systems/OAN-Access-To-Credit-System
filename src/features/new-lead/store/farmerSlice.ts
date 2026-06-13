import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService } from '../api/newLead.service';
import { extractData } from './helpers';

export interface FarmerDetails {
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: string;
  email: string;
  gender?: string;
}

interface FarmerState {
  farmerId: string;
  farmerDetails: FarmerDetails;
  isSearchingFarmer: boolean;
  searchedFarmer: FarmerDetails | null;
}

const initialState: FarmerState = {
  farmerId: '',
  farmerDetails: {
    firstName: '',
    lastName: '',
    location: '',
    phoneNumber: '',
    email: '',
  },
  isSearchingFarmer: false,
  searchedFarmer: null,
};

export const searchFarmerThunk = createAsyncThunk(
  'farmer/searchFarmer',
  async (faydaId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.searchFarmer(faydaId);
      return response;
    } catch (error) {
      const err = error as Error & { responseData?: { exc_type?: string } };
      if (err.responseData?.exc_type === 'DoesNotExistError') {
        return rejectWithValue(`Farmer with Fayda ID '${faydaId}' not found.`);
      }
      return rejectWithValue(err.message || 'Unknown Cause: Farmer search failed.');
    }
  }
);

export const fetchLeadDetailsThunk = createAsyncThunk(
  'farmer/fetchLeadDetails',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getLeadDetails(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch lead details');
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
        const payload = action.payload;
        if (payload && (payload.status === 'success' || payload.farmer)) {
          const farmerObj = payload.farmer || payload;
          const nameParts = farmerObj.name?.split(' ') || [];
          state.searchedFarmer = {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phoneNumber: farmerObj.phone || farmerObj.mobile || '',
            email: farmerObj.email || '',
            location: farmerObj.location || '',
          };
        } else {
          state.searchedFarmer = null;
        }
      })
      .addCase(searchFarmerThunk.rejected, (state) => {
        state.isSearchingFarmer = false;
        state.searchedFarmer = null;
      })
      .addCase(fetchLeadDetailsThunk.fulfilled, (state, action) => {
        const lead = extractData(action.payload);
        if (lead && Object.keys(lead).length > 0 && !Array.isArray(lead)) {
          state.farmerDetails = {
            firstName: lead.first_name || '',
            lastName: lead.last_name || '',
            phoneNumber: lead.phone_number || '',
            location: lead.location || '',
            email: lead.email || '',
            gender: lead.gender || ''
          };
          state.farmerId = lead.farmer_id || '';
        }
      })
      .addCase('consent/searchConsent/fulfilled', (state, action: any) => {
        const payload = extractData(action.payload);
        if (payload.farmer) {
          state.farmerDetails = {
            ...state.farmerDetails,
            ...payload.farmer
          };
        }
      })
      .addCase('newLead/initializeLead', (state, action: any) => {
        const payload = action.payload;
        state.farmerId = payload.farmerId || '';
        state.farmerDetails = {
          firstName: '',
          lastName: '',
          location: '',
          phoneNumber: '',
          email: '',
          ...(payload.farmerDetails || {})
        };
        state.searchedFarmer = null;
        state.isSearchingFarmer = false;
      })
      .addCase('newLead/clearForm', () => {
        return initialState;
      });
  }
});

export const { setFarmerId, updateFarmerDetails, clearFarmerState } = farmerSlice.actions;
export default farmerSlice.reducer;
