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
import { Button } from './Button';
import { normalizeLeadId } from '@/lib/utils';
import { logger } from '@/lib/logger';

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
            const cleanLeadId = normalizeLeadId(leadId);
            if (!cleanLeadId) return;
            setCheckingExisting(true);
            try {
                const appId = await loanService.findApplicationIdByLeadId(cleanLeadId, { signal: controller.signal });
                if (!controller.signal.aborted) {
                    setExistingAppId(appId);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    logger.error('Failed to check existing application:', err);
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
            router.push(`/leads/${normalizeLeadId(leadId)}/new-loan-application`);
        } catch (e: any) {
            logger.warn('Failed to create loan application:', e);
            const errorMessage = typeof e === 'string' ? e : e.message || 'Failed to create loan application';
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
            logger.error('Failed to update lead status:', e);
        }
        setModalAction(null);
    };

    const isFinalized = ['rejected', 'processed', 'granted'].includes(status?.toLowerCase() || '');
    const canHaveApplication = ['verified', 'processed', 'granted'].includes(status?.toLowerCase() || '');

    const actions = [
        {
            key: 'reject',
            label: '✕ Reject',
            variant: 'outline' as const,
            size: 'default' as const,
            disabled: isFinalized,
            onClick: () => setModalAction('reject'),
            visible: true,
        },
        {
            key: 'verify',
            label: '✓ Verify Lead',
            variant: 'primary' as const,
            size: 'default' as const,
            disabled: isFinalized || status?.toLowerCase() === 'verified',
            onClick: () => setModalAction('verify'),
            visible: true,
        },
        {
            key: 'application',
            label: isCreatingApp ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (isFinalized || existingAppId) ? (
                'Open Application'
            ) : (
                '+ New Loan Application'
            ),
            variant: 'success' as const,
            size: 'wide' as const,
            disabled: !(isFinalized || existingAppId) && (isCreatingApp || checkingExisting),
            onClick: () => {
                if (isFinalized || existingAppId) {
                    if (existingAppId) {
                        dispatch(setApplicationId(existingAppId));
                    }
                    router.push(`/leads/${normalizeLeadId(leadId)}/new-loan-application`);
                } else {
                    handleNewLoanApplication();
                }
            },
            visible: canHaveApplication,
        }
    ];

    return (
        <>
            {actions
                .filter(action => action.visible)
                .map(action => (
                    <Button
                        key={action.key}
                        variant={action.variant}
                        size={action.size}
                        disabled={action.disabled}
                        onClick={action.onClick}
                    >
                        {action.label}
                    </Button>
                ))}

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
