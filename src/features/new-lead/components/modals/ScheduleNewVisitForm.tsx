"use client";
import { logger } from '@/lib/logger';

import { Portal } from '@/components/Portal';
import { X } from 'lucide-react';
import { useId, useState } from 'react';

import { DatePickerField } from '@/components/ui/DatePickerField';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { LocationSelects, type LocationValue } from '@/components/ui/LocationSelects';
import { useModalA11y } from '@/hooks/useModalA11y';
import { normalizeLeadId } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useParams, useRouter } from 'next/navigation';
import { scheduleVisitThunk, selectVisitState } from '../..';

export interface VisitScheduleDetails {
  date: string;
  time: string;
  location: string;
  agenda: string;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
}

interface ScheduleNewVisitFormProps {
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (scheduleDetails: VisitScheduleDetails) => void | Promise<void>;
}

const isTodayDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  const today = new Date();
  return (
    selected.getFullYear() === today.getFullYear() &&
    selected.getMonth() === today.getMonth() &&
    selected.getDate() === today.getDate()
  );
};

const isPastTimeForToday = (dateStr: string, timeStr: string): boolean => {
  if (!dateStr || !timeStr || !isTodayDate(dateStr)) return false;

  let hours = 0;
  let minutes = 0;
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12 && match12[1] && match12[2] && match12[3]) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    hours = h;
    minutes = m;
  } else {
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match24 && match24[1] && match24[2]) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    } else {
      return false;
    }
  }

  const now = new Date();
  const visitTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return visitTime.getTime() < now.getTime();
};

export const ScheduleNewVisitForm = ({
  asModal = false,
  isOpen = true,
  onClose,
  onSave
}: ScheduleNewVisitFormProps) => {
  const { visitSchedule } = useAppSelector(selectVisitState);
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();

  const routeLeadId = normalizeLeadId(params?.id as string | undefined);

  // Only the visit belonging to the lead on screen may seed this form.
  //
  // The store keeps a single `visitSchedule`, so between leaving one lead and
  // `get_visit_schedules` answering for the next it still holds the previous
  // lead's visit — and seeding from that put another farmer's date, time and
  // meeting point on the form until the fetch landed. A schedule that does not
  // name its lead (the inline date picker on the lead card writes one) is still
  // accepted, so nothing regresses where the lead was never recorded.
  const seed =
    visitSchedule &&
      (!visitSchedule.leadId || !routeLeadId || normalizeLeadId(visitSchedule.leadId) === routeLeadId)
      ? visitSchedule
      : null;

  // Seeded from the visit already on the lead, so Reschedule reopens the place
  // and time that were chosen the first time round instead of an empty form.
  const [date, setDate] = useState(seed?.date || '');
  const [time, setTime] = useState(seed?.time || '');
  // The raw meeting point, not visitSchedule.location — that one falls back to
  // 'Region, Zone' for the card, and saving it here would write that synthesised
  // display string into meeting_location on every reschedule.
  const [location, setLocation] = useState(seed?.meetingLocation || '');
  const [agenda, setAgenda] = useState('');
  const [region, setRegion] = useState(seed?.region || '');
  const [zone, setZone] = useState(seed?.zone || '');
  const [woreda, setWoreda] = useState(seed?.woreda || '');
  const [kebele, setKebele] = useState(seed?.kebele || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  // Set by the agent's first edit. Anything typed after that outranks a schedule
  // that is still in flight — see the reseed below.
  const [isDirty, setIsDirty] = useState(false);

  // Reseed when a different visit becomes the active one.
  //
  // The modal opens with the schedule already in the store, so the initialisers
  // above are enough there. The inline form on /leads/[id]/schedule is not —
  // it mounts before `get_visit_schedules` answers, so it initialises against an
  // empty store and would otherwise leave the agent retyping a place the server
  // already knows.
  //
  // Adjusted during render rather than in an effect: an effect would cost a
  // second render pass on every load, and keying off the schedule's identity
  // means an unrelated re-render can never overwrite an edit in progress.
  const [seededScheduleId, setSeededScheduleId] = useState(seed?.id ?? null);
  if ((seed?.id ?? null) !== seededScheduleId) {
    setSeededScheduleId(seed?.id ?? null);
    // That fetch can resolve when the agent is already several fields into the
    // form, and prefilling is only worth having on a form nobody has touched.
    // Once dirty, an arriving schedule updates the identity being tracked and
    // nothing else, so the agent's own typing is never overwritten.
    if (!isDirty) {
      setDate(seed?.date || '');
      setTime(seed?.time || '');
      setLocation(seed?.meetingLocation || '');
      setRegion(seed?.region || '');
      setZone(seed?.zone || '');
      setWoreda(seed?.woreda || '');
      setKebele(seed?.kebele || '');
    }
  }

  // Every field writes through this, so the reseed above can tell an untouched
  // form from one the agent is part-way through filling in.
  const edited = <T,>(set: (value: T) => void) => (value: T) => {
    setIsDirty(true);
    set(value);
  };

  const applyLocation = (next: Partial<LocationValue>) => {
    if (next.region !== undefined) edited(setRegion)(next.region);
    if (next.zone !== undefined) edited(setZone)(next.zone);
    if (next.woreda !== undefined) edited(setWoreda)(next.woreda);
    if (next.kebele !== undefined) edited(setKebele)(next.kebele);
  };

  const dialogRef = useModalA11y<HTMLDivElement>(asModal && isOpen, () => onClose?.());
  const dialogTitleId = useId();

  // Body scroll lock is handled by useModalA11y (ref-counted so a stacked
  // modal underneath this one isn't unlocked prematurely).

  if (asModal && !isOpen) return null;

  const handleSave = async () => {
    if (!date || !woreda) {
      setErrorFeedback('Please fill in all required fields (Date, Woreda).');
      return;
    }

    if (isPastTimeForToday(date, time)) {
      setErrorFeedback('Cannot schedule a visit for a past time on today\'s date. Please select a future time.');
      return;
    }

    const payload = { date, time, location, agenda, region, zone, woreda, kebele };

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(payload);
      } else {
        const activeLeadId = params?.id as string;
        if (!activeLeadId) {
          setErrorFeedback('Lead ID not found');
          return;
        }
        await dispatch(scheduleVisitThunk({
          leadId: activeLeadId,
          ...payload
        })).unwrap();
        // Redirect back to lead details page
        router.push(`/leads/${normalizeLeadId(activeLeadId)}`);
      }
    } catch (err) {
      logger.error("Failed to save schedule:", err);
      setErrorFeedback(typeof err === 'string' ? err : (err instanceof Error && err.message) || 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const isPastTimeError = isPastTimeForToday(date, time);

  const formContent = (
    <>
      <div className={`flex flex-row items-center w-full px-6 py-[19.5px] border-b border-[#E5E7EB] ${asModal ? 'justify-between' : ''}`}>
        <h2 id={asModal ? dialogTitleId : undefined} className="font-roboto font-semibold text-lg leading-6 text-[#111827]">
          {asModal ? 'Schedule Visit' : 'Schedule New Visit'}
        </h2>
        {asModal && onClose && (
          <button
            onClick={onClose}
            className="flex flex-col items-start p-[4px_4px_0px] w-[28px] h-[28px] rounded-[4px] hover:bg-gray-100 transition-colors"
          >
            <X size={20} color="#0A0A0A" strokeWidth={1.66667} />
          </button>
        )}
      </div>

      <div className={`flex flex-col items-start px-6 pt-6 pb-6 gap-6 w-full ${asModal ? 'max-h-[80vh] overflow-y-auto' : ''}`}>
        <div className="flex flex-col items-start gap-6 w-full">

          {/* Date & Time Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <DatePickerField
                label="Visit Date"
                value={date}
                onChange={edited(setDate)}
                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <TimePickerField
                label="Visit Time"
                value={time}
                onChange={edited(setTime)}
                {...(isPastTimeError ? { error: 'Visit time cannot be in the past' } : {})}
                required
              />
            </div>
          </div>

          {/* Agenda / Notes */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-inter font-medium text-sm text-[#374151]">Agenda / Notes</label>
            <textarea
              placeholder="What is the purpose of this visit?"
              rows={4}
              value={agenda}
              onChange={(e) => edited(setAgenda)(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#16A34A] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] resize-none"
            />
          </div>

          {/* Region > Zone > Woreda > Kebele */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <LocationSelects
              value={{ region, zone, woreda, kebele }}
              onChange={applyLocation}
              required={{ region: true, zone: true, woreda: true, kebele: true }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-row justify-end items-center pt-4 w-full gap-4 border-t border-[#E5E7EB] mt-4 font-semibold">
          <button
            onClick={asModal && onClose ? onClose : undefined}
            className="flex justify-center items-center px-4 py-3 bg-white border border-[#D1D5DC] rounded-md text-[#374151] font-inter font-semibold text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isPastTimeError}
            className="flex justify-center items-center px-4 py-3 bg-[#16A34A] rounded-md text-white font-inter font-semibold text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#15803d] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={!!errorFeedback}
        onClose={() => setErrorFeedback(null)}
        type="error"
        title="Error"
        message={errorFeedback ?? ''}
      />
    </>
  );

  if (asModal) {
    if (!isOpen) return null;
    return (
      <Portal>
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            tabIndex={-1}
            className="relative flex flex-col items-start p-0 w-[95%] sm:w-[640px] max-w-full h-auto bg-white rounded-[10px] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {formContent}
          </div>
        </div>
      </Portal>
    );
  }

  // Default inline view
  return (
    <div className="flex flex-col items-start w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      {formContent}
    </div>
  );
};