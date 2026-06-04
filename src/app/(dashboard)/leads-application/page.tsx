'use client';

import { useEffect, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { InteractionTimelineCard } from '@/features/new-lead/components/InteractionTimelineCard';
import { ScheduleNewVisitForm } from '@/features/new-lead/components/ScheduleNewVisitForm';
import { VisitHistoryCard } from '@/features/new-lead/components/VisitHistoryCard';
import LeadContextBanner from '@/features/new-lead/components/LeadContextBanner';
import { selectNewLeadState } from '@/features/new-lead/store/newLeadSlice';
import { CreateNewLead } from '@/features/new-lead/components/CreateNewLead';

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

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleSubmit = async () => {
        const isBlank = !farmerDetails?.firstName?.trim() && !farmerDetails?.lastName?.trim() && !farmerDetails?.phoneNumber?.trim();
        
        if (isBlank) {
            setShowErrorPopup(true);
            return;
        }

        try {
            await dispatch(submitNewLeadThunk()).unwrap();
            console.log("Lead created successfully");
            setShowSuccessPopup(true);
        } catch (error) {
            console.error("Failed to create lead:", error);
            setShowSuccessPopup(true);
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
                {action === 'visit-scheduled' ? (
                    <div className="flex flex-row items-start gap-6 w-full">
                        <div className="flex flex-col items-start gap-6 flex-1 w-full">
                            <ScheduleNewVisitForm />
                        </div>
                        <div className="flex flex-col items-start gap-6 w-[314px]">
                            <VisitHistoryCard />
                        </div>
                    </div>
                ) : (
                    <CreateNewLead handleClear={handleClear} handleSubmit={handleSubmit} action={action} />
                )}

                {/* Error Popup */}
                {showErrorPopup && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-red-600 font-bold text-2xl">!</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Incomplete Form</h3>
                            <p className="text-sm text-gray-500 mb-6">You cannot submit a blank form. Please fill in the required details.</p>
                            <button onClick={() => setShowErrorPopup(false)} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Success Popup */}
                {showSuccessPopup && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Lead Created Successfully</h3>
                            <p className="text-sm text-gray-500 mb-6">The new lead has been saved to the system.</p>
                            <button onClick={() => { setShowSuccessPopup(false); router.push('/leads'); }} className="w-full py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-medium rounded-lg transition-colors">
                                Go to Lead Dashboard
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

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
