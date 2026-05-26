import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '@/services/loan.service';

export const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (filters: string) => [...loanKeys.lists(), { filters }] as const,
  details: () => [...loanKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
};

export function useLoans() {
  return useQuery({
    queryKey: loanKeys.lists(),
    queryFn: loanService.getLoans,
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loanService.getLoan(id),
    enabled: !!id,
  });
}

export function useUpdateLoanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      loanService.updateLoanStatus(id, status),
    onSuccess: (updatedLoan) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.setQueryData(loanKeys.detail(updatedLoan.id), updatedLoan);
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => loanService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
    },
  });
}
