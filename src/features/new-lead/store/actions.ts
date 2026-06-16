import { createAction } from '@reduxjs/toolkit';
import type { FarmerDetails } from '../api/newLead.service';

export interface InitializeLeadPayload {
  id?: string;
  source?: string;
  status?: string;
  farmerId?: string;
  consentDate?: string;
  consentRequestId?: string | null;
  farmerDetails?: Partial<FarmerDetails>;
}

export const initializeLead = createAction<InitializeLeadPayload>('newLead/initializeLead');
export const clearForm = createAction<void>('newLead/clearForm');
