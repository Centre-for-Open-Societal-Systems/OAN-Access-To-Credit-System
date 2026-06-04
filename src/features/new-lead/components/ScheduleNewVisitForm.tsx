import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, ChevronDown } from 'lucide-react';
import { SelectField } from '@/components/ui/SelectField';

import { DatePickerField } from '@/components/ui/DatePickerField';
import { TimePickerField } from '@/components/ui/TimePickerField';

interface ScheduleNewVisitFormProps {
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (scheduleDetails: any) => void;
}

export const ScheduleNewVisitForm = ({ 
  asModal = false, 
  isOpen = true, 
  onClose, 
  onSave 
}: ScheduleNewVisitFormProps) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [region, setRegion] = useState('');
  const [zone, setZone] = useState('');
  const [woreda, setWoreda] = useState('');
  const [kebele, setKebele] = useState('');
  
  const [mounted, setMounted] = useState(false);

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

  const handleSave = () => {
    const payload = { date, time, location, agenda, region, zone, woreda, kebele };
    if (onSave) {
      onSave(payload);
    } else {
      console.log("Saving schedule:", payload);
    }
  };

  const FormInner = () => (
    <>
      <div className={`flex flex-row items-center w-full px-6 py-[19.5px] border-b border-[#E5E7EB] ${asModal ? 'justify-between' : ''}`}>
        <h2 className="font-roboto font-semibold text-lg leading-6 text-[#111827]">
          Schedule Visit
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

      <div className={`flex flex-col items-start px-6 pt-6 pb-8 gap-6 w-full ${asModal ? 'max-h-[80vh] overflow-y-auto' : ''}`}>
        <div className="flex flex-col items-start gap-6 w-full">
          
          {/* Date & Time Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
            <div className="flex-1 w-full">
              <DatePickerField
                label="Visit Date"
                value={date}
                onChange={setDate}
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

          {/* Meeting Location */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-inter font-medium text-sm text-[#374151]">Meeting Location</label>
            <input
              type="text"
              placeholder="Enter address details"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
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

          {/* Notes */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-inter font-medium text-sm text-[#374151]">Notes</label>
            <textarea
              placeholder="Enter notes"
              rows={4}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-row justify-end items-center pt-4 w-full gap-4 border-t border-[#E5E7EB] mt-4">
          <button
            onClick={asModal && onClose ? onClose : undefined}
            className="flex justify-center items-center px-4 py-2 bg-white border border-[#D1D5DC] rounded-md text-[#374151] font-inter font-medium text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex justify-center items-center px-4 py-2 bg-[#16A34A] rounded-md text-white font-inter font-medium text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#15803d] transition-colors"
          >
            Save Schedule
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
    <div className="flex flex-col items-start w-full bg-white border border-[#D4D4D4] rounded-[12px] overflow-hidden">
      <FormInner />
    </div>
  );
};
