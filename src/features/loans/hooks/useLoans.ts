import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService, GetLoansParams } from '@/features/loans/api/loan.service';

export const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (filters: GetLoansParams) => [...loanKeys.lists(), { filters }] as const,
  details: () => [...loanKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
  summary: () => [...loanKeys.all, 'summary'] as const,
  documents: (id: string) => [...loanKeys.details(), id, 'documents'] as const,
  consent: (id: string) => [...loanKeys.details(), id, 'consent'] as const,
};

export function useLoans(params?: GetLoansParams) {
  return useQuery({
    queryKey: loanKeys.list(params || {}),
    queryFn: () => loanService.getLoans(params),
  });
}

export function useLoanSummary() {
  return useQuery({
    queryKey: loanKeys.summary(),
    queryFn: loanService.getLoanSummary,
  });
}

// Keep if needed elsewhere, though backend getLoan endpoint wasn't specified yet
export function useLoan(id: string) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loanService.getLoan(id),
    enabled: !!id,
  });
}

export function useSaveLoanDetails() {
  return useMutation({
    mutationFn: loanService.saveLoanDetails,
  });
}

export function useSaveBankDetails() {
  return useMutation({
    mutationFn: loanService.saveBankDetails,
  });
}

export function useSaveFarmerDetails() {
  return useMutation({
    mutationFn: loanService.saveFarmerDetails,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ application_id, document_type, file }: { application_id: string; document_type: string; file: File }) =>
      loanService.uploadSupportingDocument(application_id, document_type, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.documents(variables.application_id) });
    },
  });
}

export function useListDocuments(application_id: string) {
  return useQuery({
    queryKey: loanKeys.documents(application_id),
    queryFn: () => loanService.listSupportingDocuments(application_id),
    enabled: !!application_id,
  });
}

export function useGetConsentData(application_id: string) {
  return useQuery({
    queryKey: loanKeys.consent(application_id),
    queryFn: () => loanService.getConsentData(application_id),
    enabled: !!application_id,
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loanService.reviewApplication,
    onSuccess: (_, application_id) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loanService.submitApplication,
    onSuccess: (_, application_id) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
}

export function useUpdateLoanStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => loanService.updateLoanStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
}

export function useConsentApis() {
  const sendOtpAndCreateConsent = useMutation({ mutationFn: loanService.sendOtpAndCreateConsent });
  const verifyOtp = useMutation({ mutationFn: loanService.verifyOtp });
  return { sendOtpAndCreateConsent, verifyOtp };
}
