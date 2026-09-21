'use client';

import { PHONE_NUMBER_MAX_LENGTH } from '@/features/seller/constants/field-limits';
import { stripLeadingZero, toDigitsOnly } from '@/lib/validation/phone';
import { CountryCodeSelect, type CountryCodeOption } from '@/components/ui/CountryCodeSelect';
import { useState } from 'react';
import { FormCard } from './FormCard';

const CONTACT_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+255', country: 'Tanzania', flagUrl: '/images/flags/tz.svg' },
  { code: '+251', country: 'Ethiopia', flagUrl: '/images/flags/et.svg' },
  { code: '+1', country: 'United States', flagUrl: '/images/flags/us.svg' },
];

export interface ContactFields {
  registered_email: string;
  registered_phone: string;
}

interface ContactDetailsSectionProps {
  fields: ContactFields;
  onChange: (fields: Partial<ContactFields>) => void;
  isAgreed: boolean;
  setIsAgreed: (agreed: boolean) => void;
  errors?: Record<string, string>;
  onPhoneValidityChange?: (isValid: boolean) => void;
}

export function ContactDetailsSection({ fields, onChange, isAgreed, setIsAgreed, errors = {}, onPhoneValidityChange }: ContactDetailsSectionProps) {
  const [selectedPhoneCode, setSelectedPhoneCode] = useState('+255');
  // Keep local digits separate so switching the country code dropdown never
  // alters/appends to what the user already typed (Bug #27).
  const [localPhoneDigits, setLocalPhoneDigits] = useState('');
  const [isPhoneTouched, setIsPhoneTouched] = useState(false);
  const phoneLengthError =
    isPhoneTouched && localPhoneDigits.length > 0 && localPhoneDigits.length !== PHONE_NUMBER_MAX_LENGTH
      ? `Phone number must be exactly ${PHONE_NUMBER_MAX_LENGTH} digits.`
      : null;

  // Propagate the full number (code + digits) upstream whenever either changes.
  // The typed digits keep any leading trunk 0 for the on-screen field/length
  // check; it's stripped only in the value sent upstream, so "+251" + digits
  // comes out as valid E.164 rather than gaining an extra digit.
  const propagatePhone = (code: string, digits: string) => {
    onChange({ registered_phone: digits ? `${code}${stripLeadingZero(digits)}` : '' });
    onPhoneValidityChange?.(digits.length === PHONE_NUMBER_MAX_LENGTH);
  };

  return (
    <FormCard title="Contact Details" bodyClassName="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[14px] font-semibold text-[#374151]">
            Work email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            autoComplete="off"
            value={fields.registered_email}
            onChange={(e) => onChange({ registered_email: e.target.value })}
            placeholder="Enter email address"
            className={`w-full px-3 py-2.5 bg-white border ${errors.registered_email ? 'border-red-500' : 'border-[#D1D5DB]'} rounded-lg text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF]`}
          />
          {errors.registered_email ? (
            <span className="text-[12px] text-red-500">{errors.registered_email}</span>
          ) : (
            <span className="text-[12px] text-[#6B7280]">Use your work email — this will be your portal login</span>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[14px] font-semibold text-[#374151]">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-3">
            <CountryCodeSelect
              value={selectedPhoneCode}
              onChange={(code) => {
                setSelectedPhoneCode(code);
                // Re-propagate with new code but keep digits untouched
                propagatePhone(code, localPhoneDigits);
              }}
              options={CONTACT_COUNTRY_CODES}
              showChevron
              triggerClassName="flex items-center justify-between gap-2 w-[100px] px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[14px] text-[#1F2937] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all cursor-pointer"
            />
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              maxLength={PHONE_NUMBER_MAX_LENGTH}
              placeholder="Enter phone number"
              value={localPhoneDigits}
              onChange={(e) => {
                const digits = toDigitsOnly(e.target.value);
                setLocalPhoneDigits(digits);
                propagatePhone(selectedPhoneCode, digits);
              }}
              onBlur={() => setIsPhoneTouched(true)}
              className={`flex-1 px-3 py-2.5 bg-white border ${errors.registered_phone || phoneLengthError ? 'border-red-500' : 'border-[#D1D5DB]'} rounded-lg text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF]`}
            />
          </div>
          {errors.registered_phone || phoneLengthError ? (
            <span className="text-[12px] text-red-500 block mt-1">{errors.registered_phone || phoneLengthError}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="terms"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="w-4 h-4 border border-[#D1D5DB] rounded bg-white checked:bg-[#16A34A] checked:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 cursor-pointer accent-[#16A34A] transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
          />
        </div>
        <label htmlFor="terms" className="text-[14px] text-[#4B5563] leading-relaxed cursor-pointer">
          I confirm I am authorised to register this organisation and agree to the{' '}
          <a href="#" className="text-[#16A34A] hover:underline font-medium">OAN Privacy Policy</a>
          . I understand that network participation is subject to the{' '}
          <a href="#" className="text-[#16A34A] hover:underline font-medium">OAN Network Participation Agreement</a>
          , which I will review and accept before going live.
        </label>
      </div>
    </FormCard>
  );
}
