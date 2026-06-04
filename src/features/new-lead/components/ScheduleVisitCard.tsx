import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, setVisitSchedule, scheduleVisitThunk } from '../store/newLeadSlice';
import { Calendar, CalendarCheck } from 'lucide-react';
import { ScheduleNewVisitForm } from './ScheduleNewVisitForm';
import { DatePickerField } from '@/components/ui/DatePickerField';

export function ScheduleVisitCard() {
  const dispatch = useAppDispatch();
  const { visitSchedule, leadId } = useAppSelector(selectNewLeadState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVisitSchedule(e.target.value));
  };

  const handleSave = async (scheduleDetails: any) => {
    await dispatch(scheduleVisitThunk({
      leadId: leadId || 'TEMP-LEAD-ID',
      ...scheduleDetails
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-start bg-white border border-[#BFDBFE] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl w-full">
      <div className="flex flex-row items-center p-4 px-6 w-full bg-[#EFF6FF] border-b border-[#F3F4F6] rounded-t-xl">
        <div className="flex flex-row items-center gap-2">
          <Calendar size={14} className="text-[#1E3A8A]" />
          <h3 className="font-inter font-semibold text-sm leading-5 text-[#1E3A8A]">
            Schedule Visit
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-start p-5 gap-4 w-full">
        <div className="flex flex-col items-start w-full ">
          <DatePickerField
            label="Date"
            value={visitSchedule?.date || ''}
            onChange={(val) => dispatch(setVisitSchedule(val))}
            required
          />
        </div>

        <div className="flex flex-col items-start p-3 w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-md">
          <p className="font-inter font-normal text-sm leading-5 text-[#4B5563]">
            Initial assessment and Fayda OTP consent collection.
          </p>
        </div>

        <div className="flex flex-col items-start pt-1 gap-2 w-full">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-full bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md text-[#374151] font-inter font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            <CalendarCheck size={14} />
            Schedule
          </button>
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
