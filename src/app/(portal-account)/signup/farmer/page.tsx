'use client';

import { PortalShell } from '@/app/(portal-account)/components/PortalShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CountryCodeSelect, type CountryCodeOption } from '@/components/ui/CountryCodeSelect';
import { fetchApi, ApiError } from '@/lib/api/fetchApi';
import { Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Spinner } from '@/components/ui/Loader';
import { PasswordRequirements } from '@/components/ui/PasswordRequirements';
import { strongPasswordSchema } from '@/lib/api/api.schemas';
import { PHONE_NUMBER_REGEX, stripLeadingZero, toDigitsOnly } from '@/lib/validation/phone';

const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+251', flagUrl: '/images/flags/et.svg', country: 'Ethiopia' },
  { code: '+254', flagUrl: '/images/flags/ke.svg', country: 'Kenya' },
  { code: '+256', flagUrl: '/images/flags/ug.svg', country: 'Uganda' },
  { code: '+250', flagUrl: '/images/flags/rw.svg', country: 'Rwanda' },
];

export default function FarmerSignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+251');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!PHONE_NUMBER_REGEX.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const parsed = strongPasswordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'That password is not strong enough.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // The phone number is kept — the consent webhook matches a farmer profile to
      // this account by mobile_no — but the email is the credential. Registering
      // without one is rejected by the backend: there is nothing to sign in with.
      const fullPhone = `${countryCode}${stripLeadingZero(phoneNumber)}`;
      const response = await fetchApi('oan_a2c.api.v1.auth.register_user', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email: email.trim(),
          phone_number: fullPhone,
          password: password,
          role: 'A2C Farmer'
        }),
      });

      if (response.data && response.data.already_exists) {
        setError(response.data.message || 'Account already exists. Please log in.');
      } else {
        setIsSuccess(true);
      }
    } catch (e) {
      if (e instanceof ApiError || e instanceof Error) {
        setError(e.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PortalShell badge="Farmer Portal" backHref="/login/farmer">
      <div className="max-w-[460px] mx-auto w-full flex-grow flex flex-col justify-center">

        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Create Account</h2>
          <p className="text-gray-500 text-lg font-medium leading-relaxed px-4">Register as a farmer to apply for loans.</p>
        </div>

        {error && <ErrorAlert className="mb-6">{error}</ErrorAlert>}

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-200 mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h3>
              <p className="text-gray-500 font-medium">Your farmer account has been created successfully. You can now log in using your email and password.</p>
            </div>
            <Link 
              href="/login/farmer"
              className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-2xl font-extrabold text-[15px] transition-all transform active:scale-[0.98] shadow-sm flex items-center justify-center"
            >
              Proceed to Login
            </Link>
          </div>
        ) : (
          /* Signup Form */
          <form className="space-y-5 mb-8" onSubmit={handleSignUpSubmit}>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-700 flex items-center">
                Full Name <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-5 h-5" /></span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-700 flex items-center">
                Email <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-5 h-5" /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                />
              </div>
              <p className="text-[12px] text-gray-500 font-medium">
                You will sign in with this address.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-700 flex items-center">
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex shadow-sm">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={(val) => setCountryCode(val)}
                  options={COUNTRY_CODES}
                  triggerClassName="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-r-0 border-[#D1D5DB] rounded-l-xl text-[14px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] font-medium cursor-pointer hover:bg-gray-100 min-w-[90px]"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(toDigitsOnly(e.target.value))}
                  maxLength={10}
                  placeholder="Enter phone number"
                  required
                  className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-r-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-700 flex items-center">
                Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-5 h-5" /></span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-700 flex items-center">
                Confirm Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-5 h-5" /></span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                />
              </div>
            </div>

            <PasswordRequirements password={password} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-2xl font-extrabold text-[15px] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center mt-4 shadow-sm"
            >
              {isLoading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>
        )}

        {!isSuccess && (
          <p className="text-center text-gray-600 font-medium">
            Already have an account?{' '}
            <Link href="/login/farmer" className="text-[#16A34A] hover:text-[#15803d] font-bold">
              Log in
            </Link>
          </p>
        )}

      </div>
    </PortalShell>
  );
}
