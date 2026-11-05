import { normalizeLeadId } from '@/lib/utils';
import type { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { newLeadService, ScheduleVisitResponse, UpdateVisitScheduleStatusResponse, VisitScheduleAPI } from '../api/newLead.service';
import { clearForm, initializeLead } from './actions';

/**
 * The visit currently on the lead — the one "Reschedule" reopens.
 *
 * This used to hold only `{ id, date, location }`, so the reschedule form could
 * seed nothing but the date and the agent had to retype the place they had
 * already chosen. The place is four separate fields on A2C Visit Schedule
 * (`location` is only the free-text meeting point), and every one of them comes
 * back from `get_visit_schedules` — so all of them are kept here.
 *
 * Plain `string` rather than `string | undefined` on the optional members:
 * `exactOptionalPropertyTypes` is on, so a field that may be absent from the API
 * row is normalised to '' at the boundary instead of being written as undefined.
 */
interface VisitSchedule {
  id?: string;
  /**
   * The lead this visit belongs to.
   *
   * There is one `visitSchedule` for the whole app, so between navigating away
   * from one lead and `get_visit_schedules` answering for the next it still
   * holds the previous lead's visit. Without this, the reschedule form had no
   * way to tell that apart from its own data and seeded itself from it.
   */
  leadId?: string;
  date: string;
  /** 'hh:mm AM' — the format TimePickerField reads and writes. */
  time?: string;
  /**
   * Display string for the visit card: the meeting point, or the region/zone
   * when none was given. Derived — never send it back as `meeting_location`.
   */
  location?: string;
  /** The raw `meeting_location`, for seeding the reschedule form. */
  meetingLocation?: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
}

interface VisitState {
  visitSchedule: VisitSchedule | null;
  visitHistory: VisitScheduleAPI[];
}

const initialState: VisitState = {
  visitSchedule: null,
  visitHistory: [],
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

  const [, hours = '00', minutes = '00', seconds = '00', modifier] = match;
  let h = parseInt(hours, 10);

  if (modifier) {
    if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
    if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
  }

  return `${h.toString().padStart(2, '0')}:${minutes}:${seconds}`;
}

/**
 * Inverse of `formatTimeString`: the API's 'HH:mm:ss' back into the 'hh:mm AM'
 * that TimePickerField parses. Needed so a saved visit can be reopened for
 * rescheduling with its time already filled in.
 *
 * Returns '' for anything unparseable — a visit with a missing or malformed
 * time should reopen with an empty picker, not block the form.
 */
export function toDisplayTime(time?: string): string {
  const match = time?.trim().match(/^(\d{1,2}):(\d{2})/);
  const rawHours = match?.[1];
  const minutes = match?.[2];
  if (!rawHours || !minutes) return '';

  const hours24 = parseInt(rawHours, 10);
  if (Number.isNaN(hours24) || hours24 > 23) return '';

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
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
      // Spread, not replace: this only carries the date from the inline picker on
      // the lead card, and overwriting the whole object dropped the place and
      // time loaded from the server — which is exactly what Reschedule needs.
      state.visitSchedule = { ...state.visitSchedule, date: action.payload };
    },
    clearVisitState() {
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
          
          state.visitHistory = sortedSchedules;

          const activeSchedules = sortedSchedules.filter((s) => s.status !== 'Completed' && s.status !== 'Missed');

          if (activeSchedules.length > 0) {
            const latest = activeSchedules[0];
            if (latest) {
              state.visitSchedule = {
                id: latest.name,
                leadId: latest.lead ?? '',
                date: latest.visit_date,
                time: toDisplayTime(latest.visit_time),
                location: latest.meeting_location || (latest.region ? `${latest.region}, ${latest.zone}` : ''),
                meetingLocation: latest.meeting_location ?? '',
                region: latest.region ?? '',
                zone: latest.zone ?? '',
                woreda: latest.woreda ?? '',
                kebele: latest.kebele ?? '',
              };
            } else {
              state.visitSchedule = null;
            }
          } else {
            state.visitSchedule = null;
          }
        } else {
          state.visitHistory = [];
          state.visitSchedule = null;
        }
      })
      .addCase(updateVisitScheduleStatusThunk.fulfilled, (state, action) => {
        const { status, scheduleId } = action.payload.payload;
        if (status === 'Completed' || status === 'Missed') {
          state.visitSchedule = null;
        }
        const historyItem = state.visitHistory.find(h => h.name === scheduleId);
        if (historyItem) {
          historyItem.status = status;
        }
      })
      .addCase(scheduleVisitThunk.fulfilled, (state, action) => {
        const p = action.payload.payload;
        const response = action.payload.response;
        state.visitSchedule = {
          id: response.schedule_id,
          leadId: p.leadId,
          date: p.date,
          time: p.time,
          location: p.location || (p.region ? `${p.region}, ${p.zone}` : ''),
          meetingLocation: p.location,
          region: p.region,
          zone: p.zone,
          woreda: p.woreda,
          kebele: p.kebele,
        };
        const newVisit: VisitScheduleAPI = {
          name: response.schedule_id,
          lead: p.leadId,
          visit_date: p.date,
          visit_time: p.time,
          meeting_location: p.location,
          region: p.region,
          zone: p.zone,
          woreda: p.woreda,
          kebele: p.kebele,
          status: 'Scheduled',
          creation: new Date().toISOString()
        };
        state.visitHistory = [newVisit, ...state.visitHistory];
      })
      .addCase(initializeLead, (state) => {
        state.visitSchedule = null;
        state.visitHistory = [];
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { setVisitSchedule, clearVisitState } = visitSlice.actions;

export const selectVisitState = (state: RootState) => state.visit;

export const visitReducer = visitSlice.reducer;
