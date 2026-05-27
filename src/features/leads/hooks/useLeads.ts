import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLeadsThunk, selectAllLeads, selectLeadsStatus } from '../store/leadSlice';
import type { AppDispatch } from '@/store';
import { leadService } from '@/services/lead.service';
import type { GetLeadsParams } from '@/types/leads.types';

export function useLeads(params?: GetLeadsParams) {
  const dispatch = useDispatch<AppDispatch>();
  const leads = useSelector(selectAllLeads);
  const status = useSelector(selectLeadsStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLeadsThunk(params));
    }
  }, [status, dispatch, params]);

  return {
    data: leads,
    isLoading: status === 'loading' || status === 'idle',
    isError: status === 'failed',
  };
}

export function useLead(id: string) {
  const leads = useSelector(selectAllLeads);
  const lead = leads.find(l => l.id === id || l.name === id);
  
  return {
    data: lead,
    isLoading: false,
    isError: false,
  };
}
