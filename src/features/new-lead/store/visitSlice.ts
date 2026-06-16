import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService, VisitScheduleAPI, ScheduleVisitResponse, UpdateVisitScheduleStatusResponse } from '../api/newLead.service';
import { initializeLead, clearForm } from './actions';
import type { RootState } from '@/store';
import { normalizeLeadId } from '@/lib/utils';

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

export const fetchVisitSchedulesThunk = createAsyncThunk<
  VisitScheduleAPI[],
  string
>(
  'visit/fetchVisitSchedules',
  async (leadId, { rejectWithValue }) => {
    try {
      return await newLeadService.getVisitSchedules(leadId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to fetch visit schedules');
    }
  }
);

/**
 * Formats a time string into the standard 'HH:mm:ss' format.
 * Handles both 12-hour AM/PM and 24-hour formats.
 * Throws if the input cannot be parsed — callers must surface this rather
 * than sending an invalid visit_time to the backend.
 */
export function formatTimeString(time: string): string {

  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) throw new Error(`Invalid time format: "${time}"`);

  let [, hours = '00', minutes = '00', seconds = '00', modifier] = match;
  let h = parseInt(hours, 10);

  if (modifier) {
    if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
    if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
  }

  return `${h.toString().padStart(2, '0')}:${minutes}:${seconds}`;
}


export const scheduleVisitThunk = createAsyncThunk<{
  response: ScheduleVisitResponse;
  payload: { leadId: string; date: string; time: string; location: string; agenda: string; region: string; zone: string; woreda: string; kebele: string; address?: string; };
}, { leadId: string; date: string; time: string; location: string; agenda: string; region: string; zone: string; woreda: string; kebele: string; address?: string; }>(
  'visit/scheduleVisit',
  async (payload, { rejectWithValue }) => {
    try {
      const formattedTime = formatTimeString(payload.time);

      const apiPayload = {
        lead_id: normalizeLeadId(payload.leadId),
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
      return { response, payload };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to schedule visit');
    }
  }
);

export const updateVisitScheduleStatusThunk = createAsyncThunk<{
  response: UpdateVisitScheduleStatusResponse;
  payload: { leadId: string; scheduleId: string; status: string };
}, { leadId: string; scheduleId: string; status: string }>(
  'visit/updateVisitScheduleStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await newLeadService.updateVisitScheduleStatus({
        schedule_id: payload.scheduleId,
        status: payload.status,
      });
      return { response, payload };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to update visit schedule status');
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
        const schedules = action.payload;

        if (Array.isArray(schedules) && schedules.length > 0) {
          const sortedSchedules = [...schedules].sort((a, b) => {
            const dateA = a.creation || '';
            const dateB = b.creation || '';
            return dateB.localeCompare(dateA);
          });

          const activeSchedules = sortedSchedules.filter((s) => s.status !== 'Completed');

          if (activeSchedules.length > 0) {
            const latest = activeSchedules[0];
            if (latest) {
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
      .addCase(initializeLead, (state) => {
        state.visitSchedule = null;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { setVisitSchedule, clearVisitState } = visitSlice.actions;

export const selectVisitState = (state: RootState) => state.visit;

export default visitSlice.reducer;
