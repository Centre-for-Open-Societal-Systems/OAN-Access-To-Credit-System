import { useAppSelector } from '@/store/hooks';
import { toDigitsOnly } from '@/lib/validation/phone';
import { FileText } from 'lucide-react';
import { selectLeadPhoneNumber, selectLeadSource } from '../store/newLeadSlice';

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
  const displaySource = isEditable ? 'Agent Entry' : (leadSource || '');

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
          <label htmlFor="lead-source" className="text-[15px] font-semibold text-[#232F34]">
            Lead Source
          </label>
          <input
            id="lead-source"
            type="text"
            value={displaySource}
            readOnly
            className="w-full h-[42px] rounded-md border border-gray-200 px-4 text-[15px] text-[#232F34] focus:outline-none bg-gray-50"
          />
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label htmlFor="lead-phone-number" className="text-[15px] font-semibold text-[#232F34]">
            Phone Number {isEditable && <span className="text-red-500">*</span>}
          </label>
          <input
            id="lead-phone-number"
            type="text"
            inputMode="numeric"
            value={displayPhone}
            onChange={(e) => isEditable && onPhoneNumberChange && onPhoneNumberChange(toDigitsOnly(e.target.value))}
            readOnly={!isEditable}
            maxLength={10}
            placeholder={isEditable ? "Enter phone number" : ""}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:ring-offset-0 hover:border-green-600 bg-white ring-1 ring-green-600/15 ${!isEditable ? 'bg-gray-50 border-gray-200' : phoneError ? 'bg-white border-gray-200 focus:ring-2 focus:ring-red-500/20' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#16335A]/20'}`}
            style={{ boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px' }}
          />
          {phoneError && (
            <span role="alert" aria-live="assertive" className="text-sm text-red-500 mt-1">{phoneError}</span>
          )}
        </div>
      </div>
    </section>
  );
}

