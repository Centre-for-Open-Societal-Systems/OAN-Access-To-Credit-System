'use client';

import type { LoanApplicationFull } from '@/lib/api/api.schemas';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { loanService } from '../../api/loan.service';
import { LoanTableRow } from '../LoanTable';

export function useLoanApplicationModal(isOpen: boolean, data: Pick<LoanTableRow, 'id' | 'application_id'> | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<LoanApplicationFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchId = data?.application_id || data?.id;
    const controller = new AbortController();
    if (isOpen && fetchId) {
      // Signals loading immediately when the fetch starts, not just once it resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      setFullProfile(null);
      setError(null);
      loanService.getFullProfile(fetchId, { signal: controller.signal })
        .then((profileRes) => {
          if (controller.signal.aborted) return;
          setFullProfile(profileRes?.data || null);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          logger.error('Failed to fetch full profile:', err);
          setError(err instanceof Error ? err.message : 'Unable to load this application.');
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setIsLoading(false);
        });
    } else {
      setFullProfile(null);
      setError(null);
    }
    return () => controller.abort();
  }, [isOpen, data?.application_id, data?.id]);

  return { isLoading, fullProfile, error };
}

// Keys already rendered in pinned sections (loan product, amount, reason, applicant, phone).
// Used by modal variants to compute dynamic fields.
export const PINNED_OR_META_KEYS = new Set([
  // Pinned loan details
  'loan_product',
  'loan_product_name',
  'productName',
  'loan_amount',
  'amount',
  'requested_amount',
  'loan_reason',
  'purpose',
  'purpose_of_loan',

  // Pinned farmer identity
  'first_name',
  'last_name',
  'applicant',
  'phone',
  'phone_number',

  // Metadata / Timestamps
  'stage_id',
  'creation',
]);
