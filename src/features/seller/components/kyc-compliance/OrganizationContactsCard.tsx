'use client';
import {
  clearOnboardingErrors,
  saveOrgContacts,
  selectBankProfile,
  selectOnboardingMutationError,
  selectOnboardingMutationSource,
  selectOnboardingMutationStatus,
} from '@/features/seller/store/onboardingSlice';
import type { BankProfile } from '@/features/seller/api/onboarding.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PHONE_NUMBER_REGEX, toDigitsOnly } from '@/lib/validation/phone';
import { Check, Loader2, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface ContactFormState {
  groName: string;
  groMobile: string;
  opsName: string;
  opsMobile: string;
}

interface OrganizationContactsCardProps {
  profile?: BankProfile | null;
}

export function OrganizationContactsCard({ profile }: OrganizationContactsCardProps = {}) {
  const dispatch = useAppDispatch();
  const mutationStatus = useAppSelector(selectOnboardingMutationStatus);
  const mutationErrorRaw = useAppSelector(selectOnboardingMutationError);
  const mutationSource = useAppSelector(selectOnboardingMutationSource);
  const storeProfile = useAppSelector(selectBankProfile);
  const currentProfile = profile ?? storeProfile;

  const [prevProfile, setPrevProfile] = useState(currentProfile);
  const [form, setForm] = useState<ContactFormState>(() => ({
    groName: currentProfile?.gro_name ?? '',
    groMobile: currentProfile?.gro_mobile ?? '',
    opsName: currentProfile?.ops_name ?? '',
    opsMobile: currentProfile?.ops_mobile ?? '',
  }));
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(() =>
    Boolean(currentProfile?.org_grievance_updated || (currentProfile?.gro_name && currentProfile?.gro_mobile))
  );

  const [isDirty, setIsDirty] = useState(false);

  const prevContactSignature = prevProfile
    ? `${prevProfile.gro_name}:${prevProfile.gro_mobile}:${prevProfile.ops_name}:${prevProfile.ops_mobile}:${prevProfile.org_grievance_updated}`
    : null;
  const currentContactSignature = currentProfile
    ? `${currentProfile.gro_name}:${currentProfile.gro_mobile}:${currentProfile.ops_name}:${currentProfile.ops_mobile}:${currentProfile.org_grievance_updated}`
    : null;

  if (currentContactSignature !== prevContactSignature) {
    setPrevProfile(currentProfile);
    if (!isDirty) {
      setForm({
        groName: currentProfile?.gro_name ?? '',
        groMobile: currentProfile?.gro_mobile ?? '',
        opsName: currentProfile?.ops_name ?? '',
        opsMobile: currentProfile?.ops_mobile ?? '',
      });
      setIsSaved(Boolean(currentProfile?.org_grievance_updated || (currentProfile?.gro_name && currentProfile?.gro_mobile)));
    }
  }

  const handleInputChange = (field: keyof ContactFormState, value: string) => {
    setIsDirty(true);
    setForm((current) => ({ ...current, [field]: value }));
    setIsSaved(false);
    setLocalError(null);
  };

  // handleSave drives saveOrgContacts, so this card owns errors from contacts —
  // but not the document card's upload.
  const isOwnMutation = mutationSource === 'contacts';
  const mutationError = isOwnMutation ? mutationErrorRaw : null;

  const handleSave = async () => {
    if (!form.groName.trim() || !form.groMobile.trim() || !form.opsName.trim() || !form.opsMobile.trim()) {
      setLocalError('Please fill in all contact fields.');
      setIsSaved(false);
      return;
    }

    if (!PHONE_NUMBER_REGEX.test(form.groMobile) || !PHONE_NUMBER_REGEX.test(form.opsMobile)) {
      setLocalError('Mobile numbers must be exactly 10 digits.');
      setIsSaved(false);
      return;
    }

    setLocalError(null);
    setIsSaved(false);
    dispatch(clearOnboardingErrors());

    const result = await dispatch(
      saveOrgContacts({
        gro_name: form.groName.trim(),
        gro_mobile: form.groMobile.trim(),
        ops_name: form.opsName.trim(),
        ops_mobile: form.opsMobile.trim(),
      })
    );

    if (saveOrgContacts.fulfilled.match(result)) {
      setIsDirty(false);
      setIsSaved(true);
    }
  };

  const isSaving = mutationStatus === 'loading' && isOwnMutation;

  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-[#F1F3F4] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-4 border-b border-gray-200 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <UserCheck size={20} />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">Organization Contacts</h2>
          <p className="text-[14px] text-gray-500">Save your GRO and Operations contact details for compliance.</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Grievance Redressal Officer (GRO)</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={form.groName}
                onChange={(event) => handleInputChange('groName', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Mobile No.</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter phone number"
                value={form.groMobile}
                onChange={(event) => handleInputChange('groMobile', toDigitsOnly(event.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Operations Contact</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={form.opsName}
                onChange={(event) => handleInputChange('opsName', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Mobile No.</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter phone number"
                value={form.opsMobile}
                onChange={(event) => handleInputChange('opsMobile', toDigitsOnly(event.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={2.5} />}
              <span>{isSaving ? 'Saving...' : 'Save Contact and KYC'}</span>
            </button>
            {isSaved ? (
              <div className="flex items-center gap-2 text-[14px] font-bold text-[#16A34A]">
                <div className="h-2 w-2 rounded-full bg-[#16A34A]" />
                Contacts saved
              </div>
            ) : null}
            {localError || mutationError ? (
              <div className="text-[14px] font-medium text-red-500">
                {localError ?? mutationError}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
