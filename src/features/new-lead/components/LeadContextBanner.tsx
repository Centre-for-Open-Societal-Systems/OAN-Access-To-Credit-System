"use client";

import { MapPin, Phone } from 'lucide-react';

interface LeadContextBannerProps {
  leadId: string;
  farmerName?: string | undefined;
  location?: string | undefined;
  phoneNumber?: string | undefined;
  status?: string | undefined;
  createdAt?: string | undefined;
  actionType?: string | null | undefined;
  actions?: React.ReactNode;
}

export default function LeadContextBanner({
  leadId,
  farmerName = 'Unknown Farmer',
  location = 'Unknown Location',
  phoneNumber = 'No Phone',
  status = 'Unknown Status',
  createdAt = '',
  actionType = 'view',
  actions,
}: LeadContextBannerProps) {
  const isVisitScheduled = actionType === 'visit-scheduled';

  // Extract initials for visit-scheduled
  const initials = farmerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="box-border flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 w-full min-h-[90px] gap-4 md:gap-0 bg-white border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
        {/* Avatar Background */}
        {isVisitScheduled ? (
          <div className="flex flex-row justify-center items-center shrink-0 w-12 h-12 bg-[#DCFCE7] rounded-full">
            <span className="font-inter font-bold text-lg leading-7 text-center text-[#15803D]">
              {initials}
            </span>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center shrink-0 w-12 h-12 bg-[#F0FDF4] rounded-full">
            {/* Using a simple user icon SVG for the generic view */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#059669]">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}

        {/* Text Container */}
        <div className="flex flex-col items-start flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex flex-row items-center gap-2">
            <h2 className="font-inter font-bold text-lg md:text-xl leading-7 text-[#111827] truncate">
              {isVisitScheduled ? farmerName : leadId}
            </h2>
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex flex-row flex-wrap md:flex-nowrap justify-start md:justify-end items-center gap-2 md:gap-3 w-full md:w-auto font-semibold">
          {actions}
        </div>
      )}
    </div>
  );
}
