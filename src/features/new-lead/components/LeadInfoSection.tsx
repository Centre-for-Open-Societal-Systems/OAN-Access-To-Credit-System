import { useAppSelector } from '@/store/hooks';
import { selectLeadSource, selectLeadPhoneNumber } from '../store/newLeadSlice';
import { FileText } from 'lucide-react';

interface LeadInfoSectionProps {
  isEditable?: boolean;
  phoneNumber?: string;
  onPhoneNumberChange?: (value: string) => void;
  phoneError?: string;
}

export function LeadInfoSection({ isEditable = false, phoneNumber: propPhoneNumber, onPhoneNumberChange, phoneError }: LeadInfoSectionProps) {
  const leadSource = useAppSelector(selectLeadSource);
  const leadPhoneNumber = useAppSelector(selectLeadPhoneNumber);
  const displayPhone = isEditable ? (propPhoneNumber || '') : (leadPhoneNumber || '');
  const displaySource = isEditable ? '' : (leadSource || '');

  return (
    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <FileText size={20} className="text-[#6B7280]" />
          Lead Information
        </h2>
      </div>

      <div className="flex flex-col md:flex-row px-6 gap-4 md:gap-6 w-full">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Lead Source
          </label>
          <input
            type="text"
            value={displaySource}
            readOnly
            className="w-full h-[42px] rounded-md border border-gray-200 px-4 text-[15px] text-[#232F34] focus:outline-none bg-gray-50"
          />
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Phone Number {isEditable && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={displayPhone}
            onChange={(e) => isEditable && onPhoneNumberChange && onPhoneNumberChange(e.target.value)}
            readOnly={!isEditable}
            placeholder={isEditable ? "Enter Phone Number" : ""}
            className={`w-full h-[42px] rounded-md border px-4 text-[15px] text-[#232F34] focus:outline-none transition-colors ${!isEditable ? 'bg-gray-50 border-gray-200' : phoneError ? 'bg-white border-red-500 focus:ring-2 focus:ring-red-500/20' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#16335A]/20'}`}
          />
          {phoneError && (
            <span className="text-sm text-red-500 mt-1">{phoneError}</span>
          )}
        </div>
      </div>
    </section>
  );
}

