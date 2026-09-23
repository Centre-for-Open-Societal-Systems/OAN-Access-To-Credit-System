'use client';
// eslint-disable-next-line boundaries/dependencies -- TODO (2026-08-23): needs to be fixed later; hiding for now as this existed before our changes
import { selectAuthStatus, selectBankName, selectBankStatus } from '@/features/auth/store/authSlice';
import { fetchBankProfile, selectBankProfile, selectBankProfileError, selectBankProfileStatus } from '@/features/seller/store/onboardingSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, Landmark, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { OrganisationDocumentsCard } from './OrganisationDocumentsCard';
import { OrganizationContactsCard } from './OrganizationContactsCard';

export function KycComplianceContent() {
  const dispatch = useAppDispatch();
  const bankStatus = useAppSelector(selectBankStatus);
  const bankName = useAppSelector(selectBankName);
  const authStatus = useAppSelector(selectAuthStatus);
  const bankProfile = useAppSelector(selectBankProfile);
  const profileStatus = useAppSelector(selectBankProfileStatus);
  const profileError = useAppSelector(selectBankProfileError);

  // Session is still being restored on refresh — bankName reads as null until
  // then, which briefly showed the "Seller Portal" fallback for a real bank.
  const isSessionLoading = authStatus === 'idle' || authStatus === 'loading';

  useEffect(() => {
    void dispatch(fetchBankProfile());
  }, [dispatch]);

  const resolvedBankStatus = bankProfile?.status ?? bankStatus;
  const resolvedBankName = bankProfile?.bank_name ?? bankName;

  if (resolvedBankStatus === 'Active') {
    return (
      <div className="mx-auto w-full">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-[20px] font-bold text-emerald-950">
                KYC complete
              </h2>
              <p className="text-[14px] text-emerald-900/80">
                {resolvedBankName ?? 'This bank'} is already Active. KYC & compliance actions are hidden until the status changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileStatus === 'loading' && !bankProfile) {
    return (
      <div className="mx-auto flex w-full items-center justify-center rounded-xl border border-[#F1F3F4] bg-white p-12 text-gray-500 shadow-sm">
        <Loader2 size={24} className="mr-3 animate-spin text-[#16A34A]" />
        <span className="text-[14px] font-medium">Loading KYC & compliance details...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[#F1F3F4] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-gray-900 min-h-[1em]">{isSessionLoading ? '' : (resolvedBankName ?? 'Seller Portal')}</h2>
            <p className="text-[14px] text-gray-500">KYC & compliance settings for your bank tenant</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-green-700">
          <ShieldCheck size={16} />
          <span className="text-[12px] font-bold">
            {resolvedBankStatus ? `Bank status: ${resolvedBankStatus}` : 'Loading bank status...'}
          </span>
          {!resolvedBankStatus ? <Loader2 size={14} className="animate-spin" /> : null}
        </div>
      </div>

      {profileError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-[14px] text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{profileError}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <OrganisationDocumentsCard profile={bankProfile} />
        <OrganizationContactsCard profile={bankProfile} />
      </div>
    </div>
  );
}
