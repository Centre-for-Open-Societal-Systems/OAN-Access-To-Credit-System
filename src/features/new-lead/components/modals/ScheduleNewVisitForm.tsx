"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, ChevronDown, MapPin, Phone } from 'lucide-react';
import { SelectField } from '@/components/ui/SelectField';

import { DatePickerField } from '@/components/ui/DatePickerField';
import { TimePickerField } from '@/components/ui/TimePickerField';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { scheduleVisitThunk, selectVisitState } from '../..';
import { useParams, useRouter } from 'next/navigation';
import { normalizeLeadId } from '@/lib/utils';

interface ScheduleNewVisitFormProps {
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (scheduleDetails: any) => void | Promise<void>;
}

export const ScheduleNewVisitForm = ({
  asModal = false,
  isOpen = true,
  onClose,
  onSave
}: ScheduleNewVisitFormProps) => {
  const { visitSchedule } = useAppSelector(selectVisitState);

  const [date, setDate] = useState(visitSchedule?.date || '');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [region, setRegion] = useState('');
  const [zone, setZone] = useState('');
  const [woreda, setWoreda] = useState('');
  const [kebele, setKebele] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (asModal && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [asModal, isOpen]);

  if (asModal && !isOpen) return null;

  const handleSave = async () => {
    if (!date || !woreda) {
      alert('Please fill in all required fields (Date, Woreda).');
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
          alert('Error: Lead ID not found');
          return;
        }
        await dispatch(scheduleVisitThunk({
          leadId: activeLeadId,
          ...payload
        })).unwrap();
        // Redirect back to lead details page
        router.push(`/leads/${normalizeLeadId(activeLeadId)}`);
      }
    } catch (err: any) {
      console.error("Failed to save schedule:", err);
      alert(typeof err === 'string' ? err : err.message || 'Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const FormInner = () => (
    <>
      <div className={`flex flex-row items-center w-full px-6 py-[19.5px] border-b border-[#E5E7EB] ${asModal ? 'justify-between' : ''}`}>
        <h2 className="font-roboto font-semibold text-lg leading-6 text-[#111827]">
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
                onChange={setDate}
                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <TimePickerField
                label="Visit Time"
                value={time}
                onChange={setTime}
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
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] resize-none"
            />
          </div>

          {/* Region & Zone Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <SelectField
                label="Region"
                placeholder="Select Region"
                options={['Oromia', 'Amhara']}
                value={region}
                onChange={setRegion}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <SelectField
                label="Zone"
                placeholder="Select Zone"
                options={['Jimma']}
                value={zone}
                onChange={setZone}
                required
              />
            </div>
          </div>

          {/* Woreda & Kebele Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <SelectField
                label="Woreda"
                placeholder="Select Woreda"
                options={['Limmu Kosa']}
                value={woreda}
                onChange={setWoreda}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <SelectField
                label="Kebele"
                placeholder="Select Kebele"
                options={['Kebele 1']}
                value={kebele}
                onChange={setKebele}
                required
              />
            </div>
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
            disabled={isSaving}
            className="flex justify-center items-center px-4 py-3 bg-[#16A34A] rounded-md text-white font-inter font-semibold text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#15803d] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </>
  );

  if (asModal) {
    if (!mounted || !isOpen) return null;
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative flex flex-col items-start p-0 w-[95%] sm:w-[640px] max-w-full h-auto bg-white rounded-[10px] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <FormInner />
        </div>
      </div>,
      document.body
    );
  }

  // Default inline view
  return (
    <div className="flex flex-col items-start w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      <FormInner />
    </div>
  );
};