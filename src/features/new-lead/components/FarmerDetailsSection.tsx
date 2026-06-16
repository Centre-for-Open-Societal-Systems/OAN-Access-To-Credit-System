import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFarmerState, updateFarmerDetails } from '../store/farmerSlice';
import { selectConsentState } from '../store/consentSlice';
import { TextField } from '@/components/ui/TextField';
import { useParams } from 'next/navigation';
import { User } from 'lucide-react';

export function FarmerDetailsSection() {
  const dispatch = useAppDispatch();
  const { farmerDetails } = useAppSelector(selectFarmerState);
  const { isOtpVerified } = useAppSelector(selectConsentState);

  const handleChange = (field: keyof typeof farmerDetails) => (value: string) => {
    dispatch(updateFarmerDetails({ [field]: value }));
  };

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
          <label className="text-[15px] font-semibold text-[#232F34]">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={farmerDetails.firstName}
            onChange={(e) => handleChange('firstName')(e.target.value)}
            placeholder="Enter First Name"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isLocked ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={farmerDetails.lastName}
            onChange={(e) => handleChange('lastName')(e.target.value)}
            placeholder="Enter Last Name"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isLocked ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Location
          </label>
          <input
            type="text"
            value={farmerDetails.location}
            onChange={(e) => handleChange('location')(e.target.value)}
            placeholder="Enter Location"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isLocked ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={farmerDetails.phoneNumber}
            onChange={(e) => handleChange('phoneNumber')(e.target.value)}
            placeholder="Enter Phone Number"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isLocked ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Email ID
          </label>
          <input
            type="email"
            value={farmerDetails.email}
            onChange={(e) => handleChange('email')(e.target.value)}
            placeholder="Enter Email ID"
            readOnly={isLocked}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isLocked ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>
      </div>
    </section>
  );
}
