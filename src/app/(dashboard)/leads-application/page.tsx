'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLeads } from '@/features/leads/store/leadSlice';
import { initializeLead, clearForm, submitNewLeadThunk } from '@/features/new-lead/store/newLeadSlice';

// Components
import { ArrowLeft } from 'lucide-react';
import { LeadInfoSection } from '@/features/new-lead/components/LeadInfoSection';
import { ConsentManagementSection } from '@/features/new-lead/components/ConsentManagementSection';
import { FarmerDetailsSection } from '@/features/new-lead/components/FarmerDetailsSection';
import { CreditInformationSection } from '@/features/new-lead/components/CreditInformationSection';
import { CallDetailsSection } from '@/features/new-lead/components/CallDetailsSection';
import { ActivitySection } from '@/features/new-lead/components/ActivitySection';
import { ScheduleVisitCard } from '@/features/new-lead/components/ScheduleVisitCard';
import { LeadAssignmentCard } from '@/features/new-lead/components/LeadAssignmentCard';
import LeadContextBanner from '@/features/new-lead/components/LeadContextBanner';
import { selectNewLeadState } from '@/features/new-lead/store/newLeadSlice';

function LeadApplicationContent() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();
    const leads = useAppSelector(selectLeads);
    const { leadId, farmerDetails } = useAppSelector(selectNewLeadState);
    const action = searchParams.get('action');

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            // Find lead in Redux to grab source if it exists
            const existingLead = leads.find(l => l.id.replace('#', '') === id);
            dispatch(initializeLead({
                id: `#${id}`,
                source: existingLead?.source || 'Direct Entry'
            }));
        } else {
            dispatch(initializeLead({}));
        }

        return () => {
            // Cleanup on unmount if needed
        };
    }, [searchParams, leads, dispatch]);

    const handleClear = () => {
        dispatch(clearForm());
    };

    const handleSubmit = async () => {
        try {
            await dispatch(submitNewLeadThunk()).unwrap();
            console.log("Lead created successfully");
        } catch (error) {
            console.error("Failed to create lead:", error);
        }
    };

    return (
        <main className="flex flex-col items-start flex-1 w-full">
            <div className="flex flex-col items-start gap-6 w-full">

                {/* Breadcrumb Nav */}
                <div className="flex flex-col items-start gap-4 w-full">
                    <button
                        onClick={() => router.back()}
                        className="flex flex-row justify-center items-center gap-2 h-6 text-[#374151] hover:text-[#111827] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className=" text-base leading-6">Back</span>
                    </button>
                </div>

                {/* Title Section */}
                {leadId ? (
                    <LeadContextBanner 
                        leadId={leadId}
                        actionType={action}
                        farmerName={farmerDetails?.firstName ? `${farmerDetails.firstName} ${farmerDetails.lastName}` : undefined}
                        location={farmerDetails?.location || undefined}
                        phoneNumber={farmerDetails?.phoneNumber || undefined}
                    />
                ) : (
                    <div className="flex flex-row justify-between items-center p-6 w-full h-[106px] bg-white border border-[#D4D4D4] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)]">
                        <div className="flex flex-col items-start gap-1">
                            <h1 className="font-roboto font-bold text-2xl leading-8 text-[#111827]">
                                Create New Lead
                            </h1>
                            <p className="font-roboto font-normal text-sm leading-5 text-[#6B7280]">
                                Manually enter lead details to begin the qualification process.
                            </p>
                        </div>
                    </div>
                )}



                {/* Main Layout Grid */}
                <div className="flex flex-row items-start gap-6 w-full">

                    {/* Left Column (Forms) */}
                    <div className="flex flex-col items-start gap-6 flex-1 w-full">
                        <LeadInfoSection />
                        <ConsentManagementSection />
                        <FarmerDetailsSection />
                        <CreditInformationSection />
                        <CallDetailsSection />
                        <ActivitySection />

                        {/* Form Actions Bottom */}
                        <div className="flex flex-row justify-end items-center p-6 w-full bg-white border border-[#D4D4D4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl gap-4">
                            <button
                                onClick={handleClear}
                                className="flex justify-center items-center px-5 py-2.5 bg-white border border-[#D1D5DC] rounded-[10px] text-[#364153] font-inter font-medium text-sm hover:bg-gray-50 transition-colors"
                            >
                                Clear Form
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex justify-center items-center px-5 py-2.5 bg-[#16A34A] rounded-[10px] text-white font-inter font-medium text-sm shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-[#15803d] transition-colors"
                            >
                                Submit Lead
                            </button>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Cards) */}
                    <div className="flex flex-col items-start gap-6 w-[314px]">
                        <ScheduleVisitCard />
                        <LeadAssignmentCard />
                    </div>

                </div>

            </div>
        </main>
    );
}

export default function LeadApplicationPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <LeadApplicationContent />
        </Suspense>
    );
}
