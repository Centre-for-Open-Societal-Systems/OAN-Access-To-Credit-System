import { useState } from 'react';
import { X, MapPin, Calendar, Clock } from 'lucide-react';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleDetails: any) => void;
}

export default function ScheduleVisitModal({ isOpen, onClose, onSave }: ScheduleVisitModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [region, setRegion] = useState('');
  const [zone, setZone] = useState('');
  const [woreda, setWoreda] = useState('');
  const [kebele, setKebele] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Basic validation could go here
    onSave({
      date,
      time,
      location,
      agenda,
      region,
      zone,
      woreda,
      kebele,
      address,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div 
          className="relative flex flex-col items-start p-0 w-[740px] h-auto bg-white rounded-[10px] shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="box-border flex flex-row justify-between items-center p-6 w-[740px] h-[77px] border-b border-[#E5E7EB]">
            <h2 className="font-inter font-medium text-[18px] leading-[28px] text-[#111827]">
              Schedule Visit
            </h2>
            <button 
              onClick={onClose}
              className="flex flex-col items-start p-[4px_4px_0px] w-[28px] h-[28px] rounded-[4px] hover:bg-gray-100 transition-colors"
            >
              <X size={20} color="#0A0A0A" strokeWidth={1.66667} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col items-start p-[24px_24px_24px] gap-[16px] w-[740px] h-[689px] overflow-y-auto">
            
            {/* Form Fields Container */}
            <div className="flex flex-row flex-wrap items-start content-start p-0 gap-[24px] w-[689px]">
              
              {/* Date & Time Row */}
              <div className="flex flex-col items-start p-0 gap-[4px] w-[332.33px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Visit Date
                </label>
                <div className="relative w-[332.33px] h-[40px]">
                  <div className="absolute left-[12px] top-[10px]">
                    <Calendar size={18} color="#9CA3AF" strokeWidth={1.5} />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="box-border flex flex-row items-center p-[8px_12px_8px_40px] w-full h-[40px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[20px] text-[#111827]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start p-0 gap-[4px] w-[332.33px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Visit Time
                </label>
                <div className="relative w-[332.33px] h-[40px]">
                  <div className="absolute left-[12px] top-[10px]">
                    <Clock size={18} color="#9CA3AF" strokeWidth={1.5} />
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="box-border flex flex-row items-center p-[8px_12px_8px_40px] w-full h-[40px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[20px] text-[#111827]"
                  />
                </div>
              </div>

              {/* Meeting Location */}
              <div className="flex flex-col items-start p-0 gap-[4px] w-[688.66px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Meeting Location
                </label>
                <div className="relative w-full h-[38px]">
                  <div className="absolute left-[12px] top-[10px]">
                    <MapPin size={18} color="#9CA3AF" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Farmer's Primary Farm (Jimma Zone)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="box-border flex flex-row items-center p-[8px_12px_8px_40px] w-full h-full bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Agenda / Notes */}
              <div className="flex flex-col items-start p-0 gap-[4px] w-[689px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Agenda / Notes
                </label>
                <textarea
                  placeholder="What is the purpose of this visit?"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="box-border flex flex-col items-start p-[8px_12px] w-full h-[98px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] resize-none"
                />
              </div>

              {/* Region & Zone Row */}
              <div className="flex flex-col items-start p-0 gap-[4px] w-[332.33px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_16px] w-[332.33px] h-[44px] bg-white border border-[#D4D4D4] rounded-[8px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[17px] text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="flex flex-col items-start p-0 gap-[4px] w-[332.33px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Zone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_16px] w-[332.33px] h-[44px] bg-white border border-[#D4D4D4] rounded-[8px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[17px] text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Woreda & Kebele Row */}
              <div className="flex flex-col items-start p-0 gap-[4px] w-[332.33px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Woreda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Woreda"
                  value={woreda}
                  onChange={(e) => setWoreda(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_16px] w-[332.33px] h-[44px] bg-white border border-[#D4D4D4] rounded-[8px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[17px] text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="flex flex-col items-start p-0 gap-[4px] w-[332.33px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Kebele <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Kebele"
                  value={kebele}
                  onChange={(e) => setKebele(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_16px] w-[332.33px] h-[44px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[17px] text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Address / Landmark */}
              <div className="flex flex-col items-start p-0 gap-[4px] w-[688px]">
                <label className="font-inter font-medium text-[14px] leading-[20px] text-[#374151]">
                  Address/Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Near the large well, House"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="box-border flex flex-row items-center p-[8px_12px] w-full h-[42px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] font-inter text-[14px] leading-[17px] text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="box-border flex flex-row justify-end items-center p-[16px_0px_0px] gap-[12px] w-[689px] h-[55px] border-t border-[#F3F4F6] mt-auto">
              <button 
                onClick={onClose}
                className="box-border flex flex-col justify-center items-center p-[8px_16px] w-[80.48px] h-[38px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] hover:bg-gray-50 transition-colors"
              >
                <span className="font-inter font-medium text-[14px] leading-[20px] text-center text-[#374151]">
                  Cancel
                </span>
              </button>
              
              <button 
                onClick={handleSave}
                className="box-border flex flex-row justify-center items-start p-[8px_16px] min-w-[133.11px] h-[38px] bg-[#16A34A] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] hover:bg-[#15803d] transition-colors"
              >
                <span className="font-inter font-medium text-[14px] leading-[20px] text-center text-white">
                  Save Schedule
                </span>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
