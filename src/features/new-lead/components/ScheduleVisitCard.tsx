import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, selectIsLeadFinalized, setVisitSchedule, scheduleVisitThunk, fetchVisitSchedulesThunk, updateVisitScheduleStatusThunk } from '../store/newLeadSlice';
import { Calendar, CalendarCheck, Clock, MapPin, Pencil, CheckCircle } from 'lucide-react';
import { ScheduleNewVisitForm } from './modals/ScheduleNewVisitForm';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { useParams, useRouter } from 'next/navigation';

interface ScheduleVisitCardProps {
  isScheduled?: boolean;
  visitDate?: string;
  location?: string;
}

export function ScheduleVisitCard({
  isScheduled = false,
  visitDate,
  location = 'Location Not Set'
}: ScheduleVisitCardProps) {
  const dispatch = useAppDispatch();
  const { visitSchedule } = useAppSelector(selectNewLeadState);
  const isFinalized = useAppSelector(selectIsLeadFinalized);
  const params = useParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const activeLeadId = decodeURIComponent((params?.id as string) || '').replace(/^#/, '');

  const isPassed = isScheduled && visitDate ? new Date(visitDate) < new Date() : false;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVisitSchedule(e.target.value));
  };

  const handleSave = async (scheduleDetails: any) => {
    const activeLeadId = params?.id as string;
    if (!activeLeadId) {
      throw new Error("Missing Lead ID");
    }
    await dispatch(scheduleVisitThunk({
      leadId: activeLeadId,
      ...scheduleDetails
    })).unwrap();

    // Fetch the schedules and specific lead info to update the UI live without reloading
    await Promise.all([
      dispatch(fetchVisitSchedulesThunk(activeLeadId)).unwrap(),
    ]);

    setIsModalOpen(false);
  };

  const handleCompleteVisit = async () => {
    const scheduleId = visitSchedule?.id;
    if (!scheduleId) {
      alert("Error: Schedule ID not found. Try refreshing the page.");
      return;
    }

    setIsCompleting(true);
    try {
      await dispatch(updateVisitScheduleStatusThunk({
        leadId: activeLeadId,
        scheduleId,
        status: 'Completed'
      })).unwrap();

      // Refresh schedules list to clear the scheduled state live
      await dispatch(fetchVisitSchedulesThunk(activeLeadId)).unwrap();
    } catch (err: any) {
      console.error("Failed to complete visit:", err);
      alert(typeof err === 'string' ? err : err.message || 'Failed to complete visit');
    } finally {
      setIsCompleting(false);
    }
  };

  const formattedDate = visitDate ? new Date(visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date set';

  return (
    <div className="flex flex-col items-start bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl w-full relative overflow-hidden">
      {/* Left blue strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6] z-10" />

      <div className="flex flex-row items-center p-4 px-6 w-full bg-[#EFF6FF] border-b border-[#F3F4F6]">
        <div className="flex flex-row items-center gap-2">
          {isScheduled ? <Clock size={18} className="text-[#1E3A8A]" /> : <Calendar size={18} className="text-[#1E3A8A]" />}
          <h3 className="font-inter font-semibold text-lg leading-5 text-[#1E3A8A]">
            {isScheduled ? (isPassed ? 'Visit Overdue' : 'Upcoming Visit') : 'Schedule Visit'}
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-start p-5 gap-4 w-full">
        {isScheduled ? (
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="font-inter font-bold text-lg leading-7 text-[#111827]">
              {formattedDate}
            </div>
            <div className="flex flex-row items-center gap-1.5">
              <MapPin size={14} className="text-[#9CA3AF]" />
              <span className="font-inter font-normal text-sm leading-5 text-[#4B5563]">
                {location}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start w-full ">
            <DatePickerField
              label="Date"
              value={visitSchedule?.date || ''}
              onChange={(val) => dispatch(setVisitSchedule(val))}
              required
              minDate={new Date(new Date().setHours(0, 0, 0, 0))}
              disabled={isFinalized}
            />
          </div>
        )}

        <div className="flex flex-col items-start p-3 w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-md">
          <p className="font-inter font-semibold text-sm leading-5 text-[#4B5563]">
            Initial assessment and Fayda OTP consent collection.
          </p>
        </div>

        <div className="flex flex-col items-start pt-1 gap-2 w-full font-semibold">
          {isScheduled ? (
            isPassed ? (
              <button
                onClick={handleCompleteVisit}
                disabled={isCompleting || isFinalized}
                className={`flex flex-row justify-center items-center px-4 py-3 gap-2 w-full h-[44px] border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md transition-colors ${isFinalized
                  ? 'bg-[#16A34A] border-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#16A34A] border-[#15803D] hover:bg-[#10883c] text-white disabled:opacity-50'
                  }`}
              >
                {isCompleting ? (
                  <span className="text-white font-inter font-medium text-sm leading-5">Completing...</span>
                ) : (
                  <>
                    <CheckCircle size={14} className={isFinalized ? 'text-[#9CA3AF]' : 'text-white'} />
                    <span className={`font-inter font-semibold text-md leading-5 text-center ${isFinalized ? 'text-[#9CA3AF]' : 'text-white'}`}>
                      Complete Visit
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isFinalized}
                className={`flex flex-row justify-center items-center px-4 py-2 gap-2 w-full border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md font-inter font-semibold text-sm transition-colors ${isFinalized
                  ? 'bg-[#E5E7EB] border-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-white border-[#D1D5DB] text-[#374151] hover:bg-slate-50'
                  }`}
              >
                <Pencil size={14} className={isFinalized ? 'text-[#9CA3AF]' : 'text-[#374151]'} />
                Reschedule
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isFinalized}
              className={`flex flex-row justify-center items-center px-4 py-2 gap-2 w-full border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md font-inter font-semibold text-sm transition-colors ${isFinalized
                ? 'bg-[#16A34A] border-[#D1D5DB] text-[#fff] cursor-allowed'
                : 'bg-[#16A34A] border-[#16A34A] text-[#fff] hover:bg-[#10883c]'
                }`}
            >
              <CalendarCheck size={14} className={isFinalized ? 'text-[#fff]' : 'text-[#fff]'} />
              Schedule
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ScheduleNewVisitForm
          asModal={true}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
