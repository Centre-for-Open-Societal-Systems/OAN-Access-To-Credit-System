import React from 'react';
import { LeadInfoSection } from './LeadInfoSection';
import { ConsentManagementSection } from './ConsentManagementSection';
import { FarmerDetailsSection } from './FarmerDetailsSection';
import { CreditInformationSection } from './CreditInformationSection';
import { CallDetailsSection } from './CallDetailsSection';
import { ActivitySection } from './ActivitySection';
import { ScheduleVisitCard } from './ScheduleVisitCard';
import { LeadAssignmentCard } from './LeadAssignmentCard';
import { InteractionTimelineCard } from './InteractionTimelineCard';

interface CreateNewLeadProps {
    handleClear: () => void;
    handleSubmit: () => void;
    action?: string | null;
}

export function CreateNewLead({ handleClear, handleSubmit, action }: CreateNewLeadProps) {
    return (
        <div className="flex flex-col-reverse lg:flex-row items-start gap-6 w-full">
            {/* Left Column (Forms) */}
            <div className="flex flex-col items-start gap-6 flex-1 w-full min-w-0">
                <LeadInfoSection />
                <ConsentManagementSection />
                <FarmerDetailsSection />
                <CreditInformationSection />
                <CallDetailsSection />
                <ActivitySection />

                {/* Form Actions Bottom */}
                <div className="flex flex-col sm:flex-row justify-end items-center p-4 sm:p-6 w-full bg-white border border-[#D4D4D4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] rounded-xl gap-4 font-semibold">
                    <button
                        onClick={handleClear}
                        className="flex justify-center items-center px-5 py-2.5 w-full sm:w-auto bg-white border border-[#D1D5DC] rounded-[10px] text-[#364153] font-inter font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        Clear Form
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex justify-center items-center px-5 py-2.5 w-full sm:w-auto bg-[#16A34A] rounded-[10px] text-white font-inter font-medium text-sm shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-[#15803d] transition-colors"
                    >
                        Submit Lead
                    </button>
                </div>
            </div>

            {/* Right Column (Sidebar Cards) */}
            <div className="flex flex-col items-start gap-6 w-full lg:w-[314px] shrink-0 lg:sticky lg:top-6">
                <ScheduleVisitCard />
                <LeadAssignmentCard />
                {action === 'view' && <InteractionTimelineCard />}
            </div>
        </div>
    );
}
