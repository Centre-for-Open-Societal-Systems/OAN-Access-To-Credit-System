'use client';

import { ContactDetailsSection, type ContactFields } from '@/features/seller/components/register/ContactDetailsSection';
import { OrganisationSection, type OrganisationFields } from '@/features/seller/components/register/OrganisationSection';
import { RegisteredAddressSection, type RegisteredAddressFields } from '@/features/seller/components/register/RegisteredAddressSection';
import { RegisterFooterCard } from '@/features/seller/components/register/RegisterFooterCard';
import { RegisterHeaderCard } from '@/features/seller/components/register/RegisterHeaderCard';
import { performGlobalLogout } from '@/features/auth/logout';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectAuthStatus, selectUser } from '@/features/auth/store/authSlice';
import { registerBank, selectOnboardingRegistrationError, selectOnboardingRegistrationStatus } from '@/features/seller/store/onboardingSlice';
import { isValidTaxRegistrationLength } from '@/lib/validation/taxRegistration';
import { toast } from '@/lib/toast';
import type { AppDispatch } from '@/store';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const registrationStatus = useSelector(selectOnboardingRegistrationStatus);
  const registrationError = useSelector(selectOnboardingRegistrationError);
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);

  // Mirror of the dashboard's onboarding gate: a bank_admin whose bank is
  // already provisioned (bankId set) has no reason to be here, so bounce them
  // to the dashboard once auth has resolved.
  const authResolved = authStatus === 'succeeded' || authStatus === 'failed';
  const alreadyProvisioned = user?.kind === 'bank_admin' && !!user.bankId;

  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    if (authResolved && alreadyProvisioned) {
      router.replace('/dashboard');
    }
  }, [authResolved, alreadyProvisioned, router]);

  const [orgFields, setOrgFields] = useState<OrganisationFields>({
    bank_name: '',
    brand_name: '',
    entity_type: '',
    bank_code: '',
  });

  const [addressFields, setAddressFields] = useState<RegisteredAddressFields>({
    registered_street: '',
    registered_zone: '',
    registered_region: '',
    registered_country: 'Ethiopia',
    registered_postal_code: '',
    website: '',
  });

  const [contactFields, setContactFields] = useState<ContactFields>({
    registered_email: '',
    registered_phone: '',
  });
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const isLoading = registrationStatus === 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }
    if (!isValidTaxRegistrationLength(orgFields.bank_code)) {
      toast.error('Tax registration number must be 9-10 characters.');
      return;
    }
    const result = await dispatch(registerBank({
      ...orgFields,
      ...addressFields,
      ...contactFields,
      website: addressFields.website || null,
    }));
    if (registerBank.fulfilled.match(result)) {
      const message = (result.payload as { message?: string } | undefined)?.message;
      toast.success(message || 'Bank registered successfully.');
      router.push('/dashboard');
    } else if (registerBank.rejected.match(result)) {
      const msg = (result.payload as string) ?? '';
      if (msg.toLowerCase().includes('already associated')) {
        router.push('/dashboard');
      }
    }
  };

  // Don't flash the registration form while we resolve auth or redirect an
  // already-provisioned admin away.
  if (!authResolved || alreadyProvisioned) {
    return null;
  }

  const parsedErrors: Record<string, string> = {};
  if (registrationError) {
    const regex = /([^:.]+):\s([^.]+)\./g;
    let match;
    while ((match = regex.exec(registrationError)) !== null) {
      // Both groups are non-optional in the pattern, so a match always has them
      // — but `noUncheckedIndexedAccess` types the lookup as possibly undefined
      // and cannot know that. Skipping is the honest read: a group that somehow
      // came back empty has no field name to attribute the message to anyway.
      const field = match[1]?.trim();
      const errorMsg = match[2]?.trim();
      if (!field || !errorMsg) continue;


      switch (field) {
        case 'Bank Name': parsedErrors.bank_name = errorMsg; break;
        case 'Bank Code': parsedErrors.bank_code = errorMsg; break;
        case 'Entity Type': parsedErrors.entity_type = errorMsg; break;
        case 'Registered Street': parsedErrors.registered_street = errorMsg; break;
        case 'Registered Zone': parsedErrors.registered_zone = errorMsg; break;
        case 'Registered Region': parsedErrors.registered_region = errorMsg; break;
        case 'Registered Country': parsedErrors.registered_country = errorMsg; break;
        case 'Registered Postal Code': parsedErrors.registered_postal_code = errorMsg; break;
        case 'Registered Email': parsedErrors.registered_email = errorMsg; break;
        case 'Registered Phone': 
          parsedErrors.registered_phone = errorMsg.replace('Value error, ', ''); 
          break;
        case 'Website': parsedErrors.website = errorMsg; break;
      }
    }
    
    if (Object.keys(parsedErrors).length === 0) {
      parsedErrors.global = registrationError;
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto w-full pb-12 pt-8 px-4 sm:px-6">
        {/* Not a <Link> to /login/bank-admin. Everyone who reaches this page is a
            signed-in bank_admin — the only ways in are the /login/bank-admin portal and the
            dashboard's onboarding gate — and proxy.ts bounces an authenticated
            visitor off every /login route to their home route, which the gate then
            bounces straight back here. The link therefore looked inert. Leaving
            the session is the only way out, so this signs out and lands on the
            /login role chooser (see LOGIN_ROUTE in auth/rbac.ts). */}
        <button
          type="button"
          onClick={() => void performGlobalLogout(dispatch)}
          className="inline-flex items-center text-[14px] font-semibold text-[#4B5563] hover:text-[#1F2937] transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Sign In
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RegisterHeaderCard />
          <OrganisationSection
            fields={orgFields}
            onChange={(partial) => setOrgFields((prev) => ({ ...prev, ...partial }))}
            errors={parsedErrors}
          />
          <RegisteredAddressSection
            fields={addressFields}
            onChange={(partial) => setAddressFields((prev) => ({ ...prev, ...partial }))}
            errors={parsedErrors}
          />
          <ContactDetailsSection
            fields={contactFields}
            onChange={(partial) => setContactFields((prev) => ({ ...prev, ...partial }))}
            isAgreed={isAgreed}
            setIsAgreed={setIsAgreed}
            errors={parsedErrors}
            onPhoneValidityChange={setIsPhoneValid}
          />
          {parsedErrors.global && (
            <p className="text-sm text-red-600 px-1">{parsedErrors.global}</p>
          )}
          <RegisterFooterCard
            isLoading={isLoading}
            isAgreed={isAgreed}
            onBack={() => router.back()}
          />
        </form>
      </div>
    </div>
  );
}
