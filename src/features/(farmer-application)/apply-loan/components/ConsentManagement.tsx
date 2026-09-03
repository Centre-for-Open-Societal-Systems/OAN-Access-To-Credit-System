'use client';

import {
  ConsentFinalizationSection,
  ConsentManagementSection,
  clearConsentState,
} from '@/features/consent';
import { clearFarmerState } from '@/features/new-lead';
import { useAppDispatch } from '@/store/hooks';
import { useEffect } from 'react';

/**
 * The consent step of the farmer's own loan application.
 *
 * Deliberately thin: the consent flow is not reimplemented here. It is the same
 * pair of sections the Development Agent drives from `/leads/[id]`, hitting the
 * same request_otp -> verify_otp -> submit_consent endpoints against the same
 * Redux slice. 
 */
export default function ConsentManagement() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Consent state is global (one `consent` slice shared with the agent flow), so
    // clear anything a previous visit left behind before adopting this flow —
    // ensuring each loan application requires a fresh consent transaction.
    dispatch(clearConsentState());
    dispatch(clearFarmerState());
  }, [dispatch]);

  return (
    <>
      <ConsentManagementSection audience="farmer" />
      <ConsentFinalizationSection audience="farmer" />
    </>
  );
}
