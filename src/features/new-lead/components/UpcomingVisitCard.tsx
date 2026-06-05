import React from 'react';
import { Clock, MapPin, Pencil } from 'lucide-react';

interface UpcomingVisitCardProps {
    visitDate?: string;
    location?: string;
}

export function UpcomingVisitCard({
    visitDate = 'May 26, 2026, 10:00 AM',
    location = 'Jimma Zone, Kebele Office'
}: UpcomingVisitCardProps) {
    return (
        <div className="relative flex flex-col items-start w-full bg-white border border-[#BFDBFE] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
            {/* Left blue strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6] z-10" />

            {/* Header */}
            <div className="flex flex-row items-center px-6 py-4 w-full h-[53px] bg-[#EFF6FF] border-b border-[#F3F4F6]">
                <div className="flex flex-row items-center gap-2">
                    <Clock size={14} className="text-[#1E3A8A]" />
                    <span className="font-inter font-semibold text-sm leading-5 text-[#1E3A8A]">
                        Upcoming Visit
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-start p-5 gap-4 w-full">
                {/* Date & Location */}
                <div className="flex flex-col items-start gap-1 w-full">
                    <div className="font-inter font-bold text-lg leading-7 text-[#111827]">
                        {visitDate}
                    </div>
                    <div className="flex flex-row items-center gap-1.5">
                        <MapPin size={14} className="text-[#9CA3AF]" />
                        <span className="font-inter font-normal text-sm leading-5 text-[#4B5563]">
                            {location}
                        </span>
                    </div>
                </div>

                {/* Info Box */}
                <div className="flex flex-col items-start p-3 w-full bg-[#F9FAFB] border border-[#F3F4F6] rounded-md">
                    <span className="font-inter font-normal text-sm leading-5 text-[#4B5563]">
                        Initial assessment and Fayda OTP consent collection.
                    </span>
                </div>

                {/* Reschedule Button */}
                <div className="flex flex-col items-start pt-1 w-full">
                    <button className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-full h-[38px] bg-white border border-[#D1D5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-md hover:bg-gray-50 transition-colors">
                        <Pencil size={14} className="text-[#374151]" />
                        <span className="font-inter font-medium text-sm leading-5 text-[#374151] text-center">
                            Reschedule
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
