import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { splitPhoneNumber, toDigitsOnly } from '@/lib/validation/phone';
import { CountryCodeSelect, type CountryCodeOption } from '@/components/ui/CountryCodeSelect';
import { User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { selectConsentState } from '@/features/consent';
import { selectFarmerState, updateFarmerDetails } from '../store/farmerSlice';

const FARMER_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+251', country: 'Ethiopia', flagUrl: '/images/flags/et.svg' },
  { code: '+255', country: 'Tanzania', flagUrl: '/images/flags/tz.svg' },
  { code: '+254', country: 'Kenya', flagUrl: '/images/flags/ke.svg' },
  { code: '+256', country: 'Uganda', flagUrl: '/images/flags/ug.svg' },
  { code: '+250', country: 'Rwanda', flagUrl: '/images/flags/rw.svg' },
];

export function FarmerDetailsSection() {
  const dispatch = useAppDispatch();
  const { farmerDetails } = useAppSelector(selectFarmerState);
  const { isOtpVerified } = useAppSelector(selectConsentState);

  const handleChange = (field: keyof typeof farmerDetails) => (value: string) => {
    dispatch(updateFarmerDetails({ [field]: value }));
  };

  // Editing splits the combined value into a country-code selector + local
  // digits (matching the other phone fields' visual style); the store still
  // holds a single phoneNumber string, which nothing else needs split.
  const { countryCode: phoneCountryCode, localDigits: phoneLocalDigits } = splitPhoneNumber(farmerDetails.phoneNumber);
  const phoneCountryFlagUrl = FARMER_COUNTRY_CODES.find((c) => c.code === phoneCountryCode)?.flagUrl;
  const handlePhoneCodeChange = (code: string) => handleChange('phoneNumber')(`${code}${phoneLocalDigits}`);
  const handlePhoneDigitsChange = (digits: string) => handleChange('phoneNumber')(`${phoneCountryCode}${toDigitsOnly(digits)}`);

  const params = useParams();
  const isLocked = Boolean(params?.id) || isOtpVerified;
  // filed are mostly duplicated can we use case here?
  return (
    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center gap-2 text-[#232F34]">
          <User size={20} className="text-[#6B7280]" />
          Farmer Details
        </h2>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 px-6 gap-4 md:gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="farmer-first-name" className="text-[15px] font-semibold text-[#232F34]">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="farmer-first-name"
            type="text"
            value={farmerDetails.firstName}
            onChange={(e) => handleChange('firstName')(e.target.value)}
            placeholder="Enter First Name"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border px-4 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 ${isLocked ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-[#D1D5DB] bg-white text-[#232F34]'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="farmer-last-name" className="text-[15px] font-semibold text-[#232F34]">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="farmer-last-name"
            type="text"
            value={farmerDetails.lastName}
            onChange={(e) => handleChange('lastName')(e.target.value)}
            placeholder="Enter Last Name"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border px-4 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 ${isLocked ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-[#D1D5DB] bg-white text-[#232F34]'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="farmer-location" className="text-[15px] font-semibold text-[#232F34]">
            Location
          </label>
          <input
            id="farmer-location"
            type="text"
            value={farmerDetails.location}
            onChange={(e) => handleChange('location')(e.target.value)}
            placeholder="Location"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border px-4 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 ${isLocked ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-[#D1D5DB] bg-white text-[#232F34]'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="farmer-phone-number" className="text-[15px] font-semibold text-[#232F34]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          {isLocked ? (
            <div className="flex gap-2">
              <div
                aria-hidden="true"
                className="flex items-center gap-2 w-[110px] shrink-0 h-[42px] rounded-md border border-gray-200 bg-gray-100 px-3 text-[15px] text-gray-500"
              >
                {phoneCountryFlagUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={phoneCountryFlagUrl} alt="" width={20} height={16} className="w-5 h-4 rounded-sm object-cover" />
                )}
                <span>{phoneCountryCode}</span>
              </div>
              <input
                id="farmer-phone-number"
                type="text"
                value={phoneLocalDigits}
                readOnly
                className="w-full h-[42px] rounded-md border px-4 text-[15px] focus:outline-none border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <CountryCodeSelect
                value={phoneCountryCode}
                onChange={handlePhoneCodeChange}
                options={FARMER_COUNTRY_CODES}
                showChevron
                triggerClassName="flex items-center justify-between gap-2 w-[110px] shrink-0 h-[42px] rounded-md border border-[#D1D5DB] bg-white px-3 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 cursor-pointer"
              />
              <input
                id="farmer-phone-number"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={phoneLocalDigits}
                onChange={(e) => handlePhoneDigitsChange(e.target.value)}
                placeholder="Enter phone number"
                className="w-full h-[42px] rounded-md border px-4 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 border-[#D1D5DB] bg-white text-[#232F34]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="farmer-email" className="text-[15px] font-semibold text-[#232F34]">
            Email ID
          </label>
          <input
            id="farmer-email"
            type="email"
            value={farmerDetails.email}
            onChange={(e) => handleChange('email')(e.target.value)}
            placeholder="Email ID"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border px-4 text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 ${isLocked ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-[#D1D5DB] bg-white text-[#232F34]'}`}
          />
        </div>
      </div>
    </section>
  );
}
