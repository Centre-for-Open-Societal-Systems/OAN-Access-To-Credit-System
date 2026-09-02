'use client';
import { clearOnboardingErrors, saveOrgContacts, selectOnboardingMutationError, selectOnboardingMutationSource, selectOnboardingMutationStatus } from '@/features/seller/store/onboardingSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Check, Loader2, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface ContactFormState {
  groName: string;
  groMobile: string;
  opsName: string;
  opsMobile: string;
}

const initialFormState: ContactFormState = {
  groName: '',
  groMobile: '',
  opsName: '',
  opsMobile: '',
};

export function OrganizationContactsCard() {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const mutationStatus = useAppSelector(selectOnboardingMutationStatus);
  const mutationErrorRaw = useAppSelector(selectOnboardingMutationError);
  const mutationSource = useAppSelector(selectOnboardingMutationSource);
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
                onChange={(event) => setForm((current) => ({ ...current, groName: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Mobile No.</label>
              <input
                type="text"
                placeholder="Enter mobile number"
                value={form.groMobile}
                onChange={(event) => setForm((current) => ({ ...current, groMobile: event.target.value }))}
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
                onChange={(event) => setForm((current) => ({ ...current, opsName: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-[14px] transition-all focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-900">Mobile No.</label>
              <input
                type="text"
                placeholder="Enter mobile number"
                value={form.opsMobile}
                onChange={(event) => setForm((current) => ({ ...current, opsMobile: event.target.value }))}
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
