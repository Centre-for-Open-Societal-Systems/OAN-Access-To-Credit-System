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
      <div className="flex flex-row items-center p-5 w-full border-b border-[#F1F3F4]">
        <h2 className="font-inter font-semibold text-lg leading-7 flex items-center text-[#232F34]">
          Farmer Details
        </h2>
      </div>

      <div className="flex flex-row flex-wrap items-start content-start px-6 gap-6 w-full">
        <div className="w-[345px]">
          <TextField
            label="First Name"
            value={farmerDetails.firstName}
            onChange={handleChange('firstName')}
            placeholder="Enter First Name"
            readOnly={isOtpVerified}
            required
          />
        </div>
        <div className="w-[345px]">
          <TextField
            label="Last Name"
            value={farmerDetails.lastName}
            onChange={handleChange('lastName')}
            placeholder="Enter Last Name"
            readOnly={isOtpVerified}
            required
          />
        </div>
        <div className="w-[345px]">
          <TextField
            label="Location"
            value={farmerDetails.location}
            onChange={handleChange('location')}
            placeholder="Enter Location"
          />
        </div>
        <div className="w-[345px]">
          <TextField
            label="Phone Number"
            value={farmerDetails.phoneNumber}
            onChange={handleChange('phoneNumber')}
            placeholder="Enter Phone Number"
            readOnly={isOtpVerified}
            required
          />
        </div>
        <div className="w-[345px]">
          <TextField
            label="Email ID"
            value={farmerDetails.email}
            onChange={handleChange('email')}
            placeholder="Enter Email ID"
            type="email"
          />
        </div>
      </div>
    </section>
  );
}
