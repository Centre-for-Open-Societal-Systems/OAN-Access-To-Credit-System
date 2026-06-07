'use client';

import { LeadLayoutGrid } from '@/features/leads/components/LeadLayoutGrid';
import { useLeadInitialization } from '@/features/leads/hooks/useLeadInitialization';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectNewLeadState, fetchLeadMetadataThunk } from '@/features/new-lead/store/newLeadSlice';
import { selectLeads } from '@/features/leads/store/leadSlice';
import { useEffect } from 'react';

import { LeadInfoSection } from '@/features/new-lead/components/LeadInfoSection';
import { ConsentManagementSection } from '@/features/new-lead/components/ConsentManagementSection';
import { FarmerDetailsSection } from '@/features/new-lead/components/FarmerDetailsSection';
import { CreditInformationSection } from '@/features/new-lead/components/CreditInformationSection';
import { CallDetailsSection } from '@/features/new-lead/components/CallDetailsSection';
import { ActivitySection } from '@/features/new-lead/components/ActivitySection';
import { UpcomingVisitCard } from '@/features/new-lead/components/UpcomingVisitCard';
import { ScheduleVisitCard } from '@/features/new-lead/components/ScheduleVisitCard';
import { LeadAssignmentCard } from '@/features/new-lead/components/LeadAssignmentCard';
import { InteractionTimelineCard } from '@/features/new-lead/components/InteractionTimelineCard';
import LeadContextBanner from '@/features/new-lead/components/LeadContextBanner';

interface LeadDashboardProps {
    id?: string;
}

export function LeadDashboard({ id }: LeadDashboardProps) {
    const dispatch = useAppDispatch();
    useLeadInitialization(id);

    useEffect(() => {
        dispatch(fetchLeadMetadataThunk());
    }, [dispatch]);

    const leads = useAppSelector(selectLeads);
    const { farmerDetails, leadId } = useAppSelector(selectNewLeadState);

    const currentLead = leadId ? leads.find(l => l.id.replace('#', '') === leadId.replace('#', '')) : null;
    const hasScheduledVisit = Boolean(currentLead?.visitDate);

    const titleBanner = id ? (
        <LeadContextBanner
            leadId={`#${id}`}
            actionType="view"
            farmerName={farmerDetails?.firstName ? `${farmerDetails.firstName} ${farmerDetails.lastName}` : undefined}
            location={farmerDetails?.location || undefined}
            phoneNumber={farmerDetails?.phoneNumber || undefined}
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
            {hasScheduledVisit && currentLead ? (
                <UpcomingVisitCard
                    visitDate={currentLead.visitDate || undefined}
                    location={currentLead.location || undefined}
                />
            ) : (
                <ScheduleVisitCard />
            )}
            <LeadAssignmentCard />
            <InteractionTimelineCard />
        </>
    );

    return (
        <LeadLayoutGrid titleBanner={titleBanner} sidebar={sidebar}>
            <LeadInfoSection />
            <ConsentManagementSection />
            <FarmerDetailsSection />
            <CreditInformationSection />
            <CallDetailsSection />
            <ActivitySection />
        </LeadLayoutGrid>
    );
}
