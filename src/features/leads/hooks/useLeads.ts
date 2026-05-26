import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: string) => [...leadKeys.lists(), { filters }] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

export function useLeads() {
  return useQuery({
    queryKey: leadKeys.lists(),
    queryFn: leadService.getLeads,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadService.getLead(id),
    enabled: !!id,
  });
}
