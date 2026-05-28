import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import type { GetLeadsParams } from '@/types/leads.types';

export function useLeads(params?: GetLeadsParams) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadService.getLeads(params),
  });
}

export function useLeadSummary() {
  return useQuery({
    queryKey: ['leads', 'summary'],
    queryFn: leadService.getLeadSummary,
  });
}

export function useLead(id: string) {
  const { data: leads = [] } = useLeads();
  const lead = leads.find(l => l.id === id || l.name === id);

  return {
    data: lead,
    isLoading: false,
    isError: false,
  };
}
