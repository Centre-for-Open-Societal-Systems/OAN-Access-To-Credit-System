'use client';

import type { LoanApplicationFull } from '@/lib/api/api.schemas';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { loanService } from '../../api/loan.service';
import { LoanTableRow } from '../LoanTable';

export function useLoanApplicationModal(isOpen: boolean, data: LoanTableRow | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<LoanApplicationFull | null>(null);

  useEffect(() => {
    const fetchId = data?.application_id || data?.id;
    if (isOpen && fetchId) {
      // Signals loading immediately when the fetch starts, not just once it resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      loanService.getFullProfile(fetchId)
        .then((profileRes) => {
          setFullProfile(profileRes?.data || null);
        })
        .catch((err) => {
          logger.error('Failed to fetch full profile:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFullProfile(null);
    }
  }, [isOpen, data?.application_id, data?.id]);

  return { isLoading, fullProfile };
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

  // Pinned identifiers
  'farmer_id',
  'loan_officer',
  'loan_officer_name',

  // Metadata / Timestamps
  'stage_id',
  'creation',
]);
