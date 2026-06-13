'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import LeadStatusModal, { LeadStatusOutcome } from '@/features/new-lead/components/modals/LeadStatusModal';
import { updateLeadStatusThunk } from '@/features/new-lead/store/newLeadSlice';
import { createAndVerifyLoanApplicationThunk, setApplicationId } from '@/features/new-loan/store/newLoanFormSlice';
import { loanService } from '@/features/loans/api/loan.service';
import { FeedbackModal } from '@/components/ui/FeedbackModal';

interface LeadDashboardActionsProps {
    leadId: string;
    status: string;
}

export function LeadDashboardActions({ leadId, status }: LeadDashboardActionsProps) {
    const [modalAction, setModalAction] = useState<'verify' | 'reject' | null>(null);
    const [isCreatingApp, setIsCreatingApp] = useState(false);
    const [createAppError, setCreateAppError] = useState<string | null>(null);
    const [existingAppId, setExistingAppId] = useState<string | null>(null);
    const [checkingExisting, setCheckingExisting] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        const controller = new AbortController();
        const checkExistingApp = async () => {
            const cleanLeadId = leadId.replace(/^#/, '');
            if (!cleanLeadId) return;
            setCheckingExisting(true);
            try {
                const loansResponse = await loanService.getLoans(
                    { lead_id: cleanLeadId },
                    { signal: controller.signal }
                );
                const results = loansResponse?.data || [];
                if (!controller.signal.aborted && results.length > 0) {
                    setExistingAppId(results[0].application_id || null);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to check existing application:', err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCheckingExisting(false);
                }
            }
        };
        checkExistingApp();
        return () => {
            controller.abort();
        };
    }, [leadId]);

    const handleNewLoanApplication = async () => {
        setIsCreatingApp(true);
        setCreateAppError(null);
        try {
            await dispatch(createAndVerifyLoanApplicationThunk(leadId)).unwrap();
            router.push(`/leads/${leadId.replace(/^#/, '')}/new-loan-application`);
        } catch (e: any) {
            console.warn('Failed to create loan application:', e);
            const errorMessage = typeof e === 'string' ? e : e.message || 'Failed to create loan application';
            const existingAppIdFromErr = e.name;

            if (errorMessage.includes('Loan application already exists') || e.message?.includes('already exists') || existingAppIdFromErr) {
                try {
                    // Try to fetch the existing application ID if we don't have it
                    let foundAppId = existingAppIdFromErr;
                    if (!foundAppId) {
                        const loansResponse = await loanService.getLoans({ lead_id: leadId.replace(/^#/, '') });
                        const results = loansResponse?.data || [];
                        if (results.length > 0) {
                            foundAppId = results[0].application_id;
                        }
                    }

                    if (foundAppId) {
                        dispatch(setApplicationId(foundAppId));
                        router.push(`/leads/${leadId.replace(/^#/, '')}/new-loan-application`);
                        return;
                    }
                } catch (fetchErr) {
                    console.error('Failed to fetch existing application:', fetchErr);
                }
            }

            setCreateAppError(errorMessage);
        } finally {
            setIsCreatingApp(false);
        }
    };

    const handleModalConfirm = async (outcome: LeadStatusOutcome, notes: string) => {
        try {
            await dispatch(updateLeadStatusThunk({
                leadId,
                status: outcome as string,
                reason: notes || 'No reason provided.'
            })).unwrap();
            if (outcome === 'Rejected') {
                router.push('/leads');
            }
        } catch (e) {
            console.error('Failed to update lead status:', e);
        }
        setModalAction(null);
    };

    const isFinalized = ['rejected', 'processed', 'granted'].includes(status?.toLowerCase() || '');
    const canHaveApplication = ['verified', 'processed', 'granted'].includes(status?.toLowerCase() || '');

    return (
        <>
            {isFinalized ? (
                <>
                    <button
                        disabled
                        className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-[#D4D4D4] rounded-lg text-sm font-semibold text-[#D1D5DB] cursor-not-allowed"
                    >
                        ✕ Reject
                    </button>
                    <button
                        disabled
                        className="flex-1 md:flex-none px-4 py-2.5 bg-[#E5E7EB] border border-[#D1D5DB] rounded-lg text-sm font-semibold text-[#6B7280] cursor-not-allowed"
                    >
                        ✓ Verify Lead
                    </button>
                    {canHaveApplication && (
                        <button
                            onClick={() => {
                                if (existingAppId) {
                                    dispatch(setApplicationId(existingAppId));
                                }
                                router.push(`/leads/${leadId.replace(/^#/, '')}/new-loan-application`);
                            }}
                            className="w-full md:w-auto px-4 py-2.5 bg-[#16A34A] rounded-lg text-sm font-semibold text-white hover:bg-[#15803D] transition-colors flex items-center justify-center min-w-[170px]"
                        >
                            Open Application
                        </button>
                    )}
                </>
            ) : status?.toLowerCase() === 'verified' ? (
                <>
                    <button
                        onClick={() => setModalAction('reject')}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-[#D4D4D4] rounded-lg text-sm font-semibold text-[#374151] hover:bg-slate-50 transition-colors"
                    >
                        ✕ Reject
                    </button>
                    <button
                        disabled
                        className="flex-1 md:flex-none px-4 py-2.5 bg-[#E5E7EB] border border-[#D1D5DB] rounded-lg text-sm font-semibold text-[#6B7280] cursor-not-allowed"
                    >
                        ✓ Verify Lead
                    </button>
                    {existingAppId ? (
                        <button
                            onClick={() => {
                                dispatch(setApplicationId(existingAppId));
                                router.push(`/leads/${leadId.replace(/^#/, '')}/new-loan-application`);
                            }}
                            className="w-full md:w-auto px-4 py-2.5 bg-[#16A34A] rounded-lg text-sm font-semibold text-white hover:bg-[#15803D] transition-colors flex items-center justify-center min-w-[170px]"
                        >
                            Open Application
                        </button>
                    ) : (
                        <button
                            onClick={handleNewLoanApplication}
                            disabled={isCreatingApp || checkingExisting}
                            className="w-full md:w-auto px-4 py-2.5 bg-[#16A34A] rounded-lg text-sm font-semibold text-white hover:bg-[#15803D] transition-colors flex items-center justify-center min-w-[170px]"
                        >
                            {isCreatingApp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : '+ New Loan Application'}
                        </button>
                    )}
                </>
            ) : (
                <>
                    <button
                        onClick={() => setModalAction('reject')}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-[#D4D4D4] rounded-lg text-sm font-semibold text-[#374151] hover:bg-slate-50 transition-colors"
                    >
                        ✕ Reject
                    </button>
                    <button
                        onClick={() => setModalAction('verify')}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-[#087F50] rounded-lg text-sm font-semibold text-white hover:bg-[#05774A] transition-colors"
                    >
                        ✓ Verify Lead
                    </button>
                </>
            )}

            <FeedbackModal
                isOpen={!!createAppError}
                onClose={() => setCreateAppError(null)}
                type="error"
                title="Application Failed"
                message={createAppError || ''}
            />

            <LeadStatusModal
                isOpen={modalAction !== null}
                onClose={() => setModalAction(null)}
                onConfirm={handleModalConfirm}
                variant="finalize"
                currentStatus={status}
                leadId={leadId}
                initialOutcome={modalAction === 'reject' ? 'Rejected' : null}
            />
        </>
    );
}
