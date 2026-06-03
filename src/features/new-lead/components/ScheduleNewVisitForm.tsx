import { useState } from 'react';
import { X, Calendar, Clock, MapPin, ChevronDown } from 'lucide-react';

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
  const [address, setAddress] = useState('');

  if (asModal && !isOpen) return null;

  const handleSave = () => {
    const payload = { date, time, location, agenda, region, zone, woreda, kebele, address };
    if (onSave) {
      onSave(payload);
    } else {
      console.log("Saving schedule:", payload);
    }
  };

  const FormInner = () => (
    <>
      <div className={`flex flex-row items-center w-full px-6 py-[19.5px] border-b border-[#E5E7EB] ${asModal ? 'justify-between' : ''}`}>
        <h2 className="font-roboto font-semibold text-base leading-6 text-[#111827]">
          Schedule New Visit
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

      <div className={`flex flex-col items-start px-6 pt-6 pb-8 gap-6 w-full ${asModal ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
        <div className="flex flex-col items-start gap-6 w-full">
          
          {/* Date & Time Row */}
          <div className="flex flex-row items-start gap-4 w-full">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-inter font-medium text-sm text-[#374151]">Visit Date</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-[#9CA3AF]" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-inter font-medium text-sm text-[#374151]">Visit Time</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock size={16} className="text-[#9CA3AF]" />
                </div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          {/* Meeting Location */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-inter font-medium text-sm text-[#374151]">Meeting Location</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                placeholder="Farmer's Primary Farm (Jimma Zone)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
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
          <div className="flex flex-row items-start gap-4 w-full">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-inter font-medium text-sm text-[#374151]">
                Region <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] appearance-none"
                >
                  <option value="" disabled hidden>Select Region</option>
                  <option value="oromia">Oromia</option>
                  <option value="amhara">Amhara</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-[#9CA3AF]" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-inter font-medium text-sm text-[#374151]">
                Zone <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] appearance-none"
                >
                  <option value="" disabled hidden>Select Zone</option>
                  <option value="jimma">Jimma</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-[#9CA3AF]" />
                </div>
              </div>
            </div>
          </div>

          {/* Woreda & Kebele Row */}
          <div className="flex flex-row items-start gap-4 w-full">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-inter font-medium text-sm text-[#374151]">
                Woreda <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  value={woreda}
                  onChange={(e) => setWoreda(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] appearance-none"
                >
                  <option value="" disabled hidden>Select Woreda</option>
                  <option value="limmu">Limmu Kosa</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-[#9CA3AF]" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-inter font-medium text-sm text-[#374151]">
                Kebele <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Kebele"
                value={kebele}
                onChange={(e) => setKebele(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {/* Address/Landmark */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-inter font-medium text-sm text-[#374151]">
              Address/Landmark <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Near the large well, House"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D1D5DC] rounded-md text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-row justify-end items-center py-4 w-full gap-4 border-t border-[#F3F4F6] mt-4">
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
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="relative flex flex-col items-start p-0 w-[740px] h-auto bg-white rounded-[10px] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <FormInner />
        </div>
      </div>
    );
  }

  // Default inline view
  return (
    <div className="flex flex-col items-start w-full bg-white border border-[#D4D4D4] rounded-[12px] overflow-hidden">
      <FormInner />
    </div>
  );
};
