'use client';

import {
    clearOnboardingErrors, registerSeller,
    selectOnboardingRegistrationError,
    selectOnboardingRegistrationStatus
} from '@/features/seller/store/onboardingSlice';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CountryCodeSelect, type CountryCodeOption } from '@/components/ui/CountryCodeSelect';
import { PHONE_NUMBER_MAX_LENGTH } from '@/features/seller/constants/field-limits';
import { PHONE_NUMBER_REGEX, stripLeadingZero, toDigitsOnly } from '@/lib/validation/phone';
import { registerSellerSchema } from '@/lib/api/api.schemas';
import { toast } from '@/lib/toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ArrowRight, Eye, EyeOff, Info, Lock, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CREATE_ACCOUNT_COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+251', country: 'Ethiopia', flagUrl: '/images/flags/et.svg' },
  { code: '+255', country: 'Tanzania', flagUrl: '/images/flags/tz.svg' },
];

export function CreateAccountForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const registrationStatus = useAppSelector(selectOnboardingRegistrationStatus);
  const registrationError = useAppSelector(selectOnboardingRegistrationError);

  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+251');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    dispatch(clearOnboardingErrors());

    if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
      setLocalError('Mobile number must be exactly 10 digits.');
      return;
    }

    const fullMobileNumber = `${countryCode}${stripLeadingZero(phoneNumber)}`;

    const validationResult = registerSellerSchema.safeParse({
      email,
      full_name: fullName,
      password,
      phone_number: fullMobileNumber,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setLocalError(firstIssue?.message ?? 'Invalid registration details.');
      return;
    }

    const result = await dispatch(registerSeller(validationResult.data));

    if (registerSeller.fulfilled.match(result)) {
      const successMsg =
        (result.payload as { message?: string } | undefined)?.message ??
        'Account registered successfully. You may now login.';
      toast.success(successMsg);
      router.push('/login/bank-admin');
    }
  };

  const isLoading = registrationStatus === 'loading';
  const displayError = localError || registrationError;

  return (
    <div className="max-w-[420px] mx-auto w-full flex-grow flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="text-[32px] font-extrabold text-gray-900 mb-3 tracking-tight">Create Account</h2>
        <p className="text-gray-500 text-[15px] font-medium leading-relaxed px-4">
          Register as a seller bank administrator on the agricultural credit system network.
        </p>
      </div>

      {displayError && <ErrorAlert className="mb-4">{displayError}</ErrorAlert>}

      {/* Form Fields */}
      <form className="space-y-4 mb-6" onSubmit={handleRegisterSubmit} autoComplete="off">
        {/* Full name */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="First and last name"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Mobile number */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
            Mobile number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <CountryCodeSelect
              value={countryCode}
              onChange={setCountryCode}
              options={CREATE_ACCOUNT_COUNTRY_CODES}
              showChevron
              triggerClassName="flex items-center justify-between gap-2 w-[100px] shrink-0 bg-white border border-gray-200 rounded-xl pl-4 pr-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition-colors cursor-pointer"
            />
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              maxLength={PHONE_NUMBER_MAX_LENGTH}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(toDigitsOnly(e.target.value))}
              placeholder="Enter phone number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Email ID */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
            Email ID <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email id"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center mb-1.5">
            <div className="absolute left-3 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            Min 8 chars, with at least 1 letter, 1 number, and 1 special char.
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#16A34A] hover:bg-[#158e41] text-white text-base font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
        >
          {isLoading ? 'Registering...' : 'Register Account'}
          {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>
    </div>
  );
}
