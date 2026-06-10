'use client';

import { LeadLayoutGrid } from '@/features/leads/components/LeadLayoutGrid';
import { useLeadInitialization } from '@/features/leads/hooks/useLeadInitialization';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, fetchLeadMetadataThunk, fetchLeadDetailsThunk, fetchVisitSchedulesThunk, fetchActivitiesThunk } from '@/features/new-lead/store/newLeadSlice';
import { selectLeads } from '@/features/leads/store/leadSlice';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import LeadStatusModal, { LeadStatusOutcome } from '@/features/new-lead/components/modals/LeadStatusModal';
import { updateLeadStatusThunk, fetchSpecificLeadThunk } from '@/features/new-lead/store/newLeadSlice';
import { createLoanApplicationAPI, setApplicationId } from '@/features/new-loan/store/newLoanFormSlice';
import { loanService } from '@/features/loans/api/loan.service';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { LeadInfoSection } from '@/features/new-lead/components/LeadInfoSection';
import { ConsentManagementSection } from '@/features/new-lead/components/ConsentManagementSection';
import { FarmerDetailsSection } from '@/features/new-lead/components/FarmerDetailsSection';
import { CreditInformationSection } from '@/features/new-lead/components/CreditInformationSection';
import { CallDetailsSection } from '@/features/new-lead/components/CallDetailsSection';
import { ActivitySection } from '@/features/new-lead/components/ActivitySection';
import { ScheduleVisitCard } from '@/features/new-lead/components/ScheduleVisitCard';
import { LeadAssignmentCard } from '@/features/new-lead/components/LeadAssignmentCard';
import { InteractionTimelineCard } from '@/features/new-lead/components/InteractionTimelineCard';
import LeadContextBanner from '@/features/new-lead/components/LeadContextBanner';

interface LeadDashboardProps {
    id?: string;
}

function LeadDashboardActions({ leadId, status }: { leadId: string, status: string }) {
    const [modalAction, setModalAction] = useState<'verify' | 'reject' | null>(null);
    const [isCreatingApp, setIsCreatingApp] = useState(false);
    const [createAppError, setCreateAppError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleNewLoanApplication = async () => {
        setIsCreatingApp(true);
        setCreateAppError(null);
        try {
            await dispatch(createLoanApplicationAPI(leadId)).unwrap();
            await dispatch(updateLeadStatusThunk({
                leadId,
                status: 'Processed',
                reason: 'Loan application created.'
            })).unwrap();
            router.push(`/leads/${leadId.replace(/^#/, '')}/new-loan-application`);
        } catch (e: any) {
            console.warn('Failed to create loan application:', e);
            const errorMessage = typeof e === 'string' ? e : e.message || 'Failed to create loan application';
            const existingAppId = e.application_id;

            if (errorMessage.includes('Loan application already exists')) {
                try {
                    // Try to fetch the existing application ID if we don't have it
                    let foundAppId = existingAppId;
                    if (!foundAppId) {
                        const loansResponse = await loanService.getLoans({ search_query: leadId.replace(/^#/, '') });
                        if (loansResponse?.results && loansResponse.results.length > 0) {
                            foundAppId = loansResponse.results[0].id;
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

    return (
        <>
            {status?.toLowerCase() === 'processed' ? (
                <>
                    <button
                        disabled
                        className="px-4 py-2 bg-white border border-[#D4D4D4] rounded-lg text-sm font-medium text-[#D1D5DB] cursor-not-allowed"
                    >
                        ✕ Reject
                    </button>
                    <button
                        disabled
                        className="px-4 py-2 bg-[#E5E7EB] border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#6B7280] cursor-not-allowed"
                    >
                        ✓ Verify Lead
                    </button>
                    <button
                        onClick={() => router.push(`/leads/${leadId.replace(/^#/, '')}/new-loan-application`)}
                        className="px-4 py-2 bg-[#16A34A] rounded-lg text-sm font-medium text-white hover:bg-[#15803D] transition-colors flex items-center justify-center min-w-[170px]"
                    >
                        Open Application
                    </button>
                </>
            ) : status?.toLowerCase() === 'verified' ? (
                <>
                    <button
                        onClick={() => setModalAction('reject')}
                        className="px-4 py-2 bg-white border border-[#D4D4D4] rounded-lg text-sm font-medium text-[#374151] hover:bg-slate-50 transition-colors"
                    >
                        ✕ Reject
                    </button>
                    <button
                        disabled
                        className="px-4 py-2 bg-[#E5E7EB] border border-[#D1D5DB] rounded-lg text-sm font-medium text-[#6B7280] cursor-not-allowed"
                    >
                        ✓ Verify Lead
                    </button>
                    <button
                        onClick={handleNewLoanApplication}
                        disabled={isCreatingApp}
                        className="px-4 py-2 bg-[#16A34A] rounded-lg text-sm font-medium text-white hover:bg-[#15803D] transition-colors flex items-center justify-center min-w-[170px]"
                    >
                        {isCreatingApp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : '+ New Loan Application'}
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => setModalAction('reject')}
                        className="px-4 py-2 bg-white border border-[#D4D4D4] rounded-lg text-sm font-medium text-[#374151] hover:bg-slate-50 transition-colors"
                    >
                        ✕ Reject
                    </button>
                    <button
                        onClick={() => setModalAction('verify')}
                        className="px-4 py-2 bg-[#087F50] rounded-lg text-sm font-medium text-white hover:bg-[#05774A] transition-colors"
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

export function LeadDashboard({ id }: LeadDashboardProps) {
    const dispatch = useAppDispatch();
    useLeadInitialization(id);

    useEffect(() => {
        dispatch(fetchLeadMetadataThunk());
        if (id) {
            dispatch(fetchLeadDetailsThunk(id));
            dispatch(fetchVisitSchedulesThunk(id));
            dispatch(fetchSpecificLeadThunk(id));
            dispatch(fetchActivitiesThunk(id));
        }
    }, [dispatch, id]);

    const leads = useAppSelector(selectLeads);
    const { farmerDetails, visitSchedule, leadStatus } = useAppSelector(selectNewLeadState);

    const currentLead = id ? leads.find(l => l.id.replace('#', '') === id.replace('#', '')) : null;
    const hasScheduledVisit = Boolean(currentLead?.visitDate) || Boolean(visitSchedule?.id);

    const titleBanner = id ? (
        <LeadContextBanner
            leadId={`#${id}`}
            actionType="view"
            farmerName={farmerDetails?.firstName ? `${farmerDetails.firstName} ${farmerDetails.lastName}` : undefined}
            location={farmerDetails?.location || undefined}
            phoneNumber={farmerDetails?.phoneNumber || undefined}
            status={leadStatus}
            actions={<LeadDashboardActions leadId={`#${id}`} status={leadStatus} />}
        />
    ) : (
        <div className="flex flex-row justify-between items-center p-6 w-full bg-white border border-[#D4D4D4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col items-start gap-1">
                <h1 className="font-roboto font-bold text-2xl leading-8 text-[#111827]">
                    Create New Lead
                </h1>
                <p className="font-roboto font-normal text-sm leading-5 text-[#6B7280]">
                    Manually enter lead details to begin the qualification process.
                </p>
            </div>
        </div>
    );

    const sidebar = (
        <>
            <ScheduleVisitCard
                isScheduled={hasScheduledVisit}
                visitDate={visitSchedule?.date || undefined}
                location={visitSchedule?.location || undefined}
            />
            {id && <LeadAssignmentCard />}
            {id && <InteractionTimelineCard />}
        </>
    );

    return (
        <LeadLayoutGrid titleBanner={titleBanner} sidebar={sidebar} isViewMode={Boolean(id)}>
            <LeadInfoSection />
            <ConsentManagementSection />
            <FarmerDetailsSection />
            <CreditInformationSection />
            <CallDetailsSection />
            <ActivitySection />
        </LeadLayoutGrid>
    );
}
