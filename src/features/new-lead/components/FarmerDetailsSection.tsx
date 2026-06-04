import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewLeadState, updateFarmerDetails } from '../store/newLeadSlice';
import { TextField } from '@/components/ui/TextField';

export function FarmerDetailsSection() {
  const dispatch = useAppDispatch();
  const { farmerDetails, isOtpVerified } = useAppSelector(selectNewLeadState);

  const handleChange = (field: keyof typeof farmerDetails) => (value: string) => {
    dispatch(updateFarmerDetails({ [field]: value }));
  };
  // filed are mostly duplicated can we use case here?
  return (
    <section className="flex flex-col items-center pb-6 gap-4 w-full bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl">
      <div className="flex flex-row items-center p-5 w-full border-b border-[#dedede]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
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
            value=''
            onChange={(e) => handleChange('firstName')(e.target.value)}
            placeholder="Enter First Name"
            readOnly={isOtpVerified}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isOtpVerified ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value=''
            onChange={(e) => handleChange('lastName')(e.target.value)}
            placeholder="Enter Last Name"
            readOnly={isOtpVerified}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isOtpVerified ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Location
          </label>
          <input
            type="text"
            value=''
            onChange={(e) => handleChange('location')(e.target.value)}
            placeholder="Enter Location"
            className="w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none bg-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value=''
            onChange={(e) => handleChange('phoneNumber')(e.target.value)}
            placeholder="Enter Phone Number"
            readOnly={isOtpVerified}
            className={`w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none ${isOtpVerified ? 'bg-gray-50' : 'bg-white'}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-[#232F34]">
            Email ID
          </label>
          <input
            type="email"
            value=''
            onChange={(e) => handleChange('email')(e.target.value)}
            placeholder="Enter Email ID"
            className="w-full h-[42px] rounded-md border border-[#D1D5DB] px-4 text-[15px] text-[#232F34] focus:outline-none bg-white"
          />
        </div>
      </div>
    </section>
  );
}
