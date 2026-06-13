import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService } from '../api/newLead.service';
import { extractData } from './helpers';

interface VisitSchedule {
  id?: string;
  date: string;
  location?: string;
}

interface VisitState {
  visitSchedule: VisitSchedule | null;
}

const initialState: VisitState = {
  visitSchedule: null,
};

export const fetchVisitSchedulesThunk = createAsyncThunk(
  'visit/fetchVisitSchedules',
  async (leadId: string, { rejectWithValue }) => {
    try {
      const response = await newLeadService.getVisitSchedules(leadId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to fetch visit schedules');
    }
  }
);

/**
 * Formats a time string into the standard 'HH:mm:00' format.
 * Handles both 12-hour AM/PM and 24-hour formats.
 * Defaults to '09:00:00'.
 */
export function formatTimeString(time: string): string {

  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return '';

  let [, hours = '00', minutes = '00', seconds = '00', modifier] = match;
  let h = parseInt(hours, 10);

  if (modifier) {
    if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
    if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
  }

  return `${h.toString().padStart(2, '0')}:${minutes}:${seconds}`;
}


export const scheduleVisitThunk = createAsyncThunk(
  'visit/scheduleVisit',
  async (payload: { leadId: string; date: string; time: string; location: string; agenda: string; region: string; zone: string; woreda: string; kebele: string; address?: string; }, { rejectWithValue }) => {
    try {
      const formattedTime = formatTimeString(payload.time);

      const apiPayload = {
        lead_id: decodeURIComponent(payload.leadId).replace(/^#/, ''),
        visit_date: payload.date,
        visit_time: formattedTime,
        region: payload.region,
        zone: payload.zone,
        woreda: payload.woreda,
        kebele: payload.kebele,
        meeting_location: payload.location,
        notes: payload.agenda,
      };
      const response = await newLeadService.scheduleVisit(apiPayload);
      return { ...response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to schedule visit');
    }
  }
);

export const updateVisitScheduleStatusThunk = createAsyncThunk(
  'visit/updateVisitScheduleStatus',
  async (payload: { leadId: string; scheduleId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await newLeadService.updateVisitScheduleStatus({
        schedule_id: payload.scheduleId,
        status: payload.status,
      });
      return { response, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown Cause: Failed to update visit schedule status');
    }
  }
);

const visitSlice = createSlice({
  name: 'visit',
  initialState,
  reducers: {
    setVisitSchedule(state, action: PayloadAction<string>) {
      state.visitSchedule = { date: action.payload };
    },
    clearVisitState(state) {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitSchedulesThunk.fulfilled, (state, action) => {
        let schedules = extractData(action.payload);

        if (!Array.isArray(schedules) && schedules && Object.keys(schedules).length > 0) {
          schedules = [schedules];
        }

        if (Array.isArray(schedules) && schedules.length > 0) {
          const sortedSchedules = [...schedules].sort((a, b) => {
            const dateA = a.creation || '';
            const dateB = b.creation || '';
            return dateB.localeCompare(dateA);
          });

          const activeSchedules = sortedSchedules.filter((s: any) => s.status !== 'Completed');

          if (activeSchedules.length > 0) {
            const latest = activeSchedules[0];
            state.visitSchedule = {
              id: latest.name,
              date: latest.visit_date,
              location: latest.meeting_location || (latest.region ? `${latest.region}, ${latest.zone}` : '')
            };
          } else {
            state.visitSchedule = null;
          }
        } else {
          state.visitSchedule = null;
        }
      })
      .addCase(updateVisitScheduleStatusThunk.fulfilled, (state, action) => {
        const { status } = action.payload.payload;
        if (status === 'Completed') {
          state.visitSchedule = null;
        }
      })
      .addCase(scheduleVisitThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        state.visitSchedule = {
          date: p.date,
          location: p.location || (p.region ? `${p.region}, ${p.zone}` : '')
        };
      })
      .addCase('newLead/initializeLead', (state) => {
        state.visitSchedule = null;
      })
      .addCase('newLead/clearForm', () => {
        return initialState;
      });
  }
});

export const { setVisitSchedule, clearVisitState } = visitSlice.actions;
export default visitSlice.reducer;
