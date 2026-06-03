import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setVisitSchedule } from '../store/newLeadSlice';
import { Calendar, CalendarCheck } from 'lucide-react';

export function ScheduleVisitCard() {
  const dispatch = useAppDispatch();
  const { visitSchedule } = useAppSelector(selectNewLeadState);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVisitSchedule(e.target.value));
  };

  return (
    <div className="flex flex-col items-start bg-white border border-[#BFDBFE] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl w-[314px]">
      <div className="flex flex-row items-center p-4 px-6 w-full bg-[#EFF6FF] border-b border-[#F3F4F6] rounded-t-xl">
        <div className="flex flex-row items-center gap-2">
          <Calendar size={14} className="text-[#1E3A8A]" />
          <h3 className="font-inter font-semibold text-sm leading-5 text-[#1E3A8A]">
            Schedule Visit
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-start p-5 gap-4 w-full">
        <div className="flex flex-col items-start gap-1.5 w-full">
          <label className="text-sm font-medium text-gray-700 font-inter">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <input
              type="date"
              value={visitSchedule?.date || ''}
              onChange={handleDateChange}
              className="w-full rounded-md border border-[#D1D5DB] px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col items-start p-3 w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-md">
          <p className="font-inter font-normal text-sm leading-5 text-[#4B5563]">
            Initial assessment and Fayda OTP consent collection.
          </p>
        </div>

        <div className="flex flex-col items-start pt-1 gap-2 w-full">
          <button
            type="button"
            onClick={() => {/* Mock Schedule API */}}
            className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-full bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md text-[#374151] font-inter font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            <CalendarCheck size={14} />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
