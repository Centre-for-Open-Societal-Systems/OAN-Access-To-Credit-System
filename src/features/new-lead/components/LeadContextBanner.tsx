import { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import LeadStatusModal, { LeadStatusOutcome } from './modals/LeadStatusModal';

interface LeadContextBannerProps {
  leadId: string;
  farmerName?: string;
  location?: string;
  phoneNumber?: string;
  status?: string;
  createdAt?: string;
  actionType?: string | null;
}

export default function LeadContextBanner({
  leadId,
  farmerName = 'Abebe Kebede',
  location = 'Oromia, Jimma Zone',
  phoneNumber = '+251 911 234 567',
  status = 'INITIATED',
  createdAt = 'May 24, 2026 10:30 AM',
  actionType = 'view',
}: LeadContextBannerProps) {
  const isVisitScheduled = actionType === 'visit-scheduled';
  const [modalAction, setModalAction] = useState<'verify' | 'reject' | null>(null);

  const handleModalConfirm = (outcome: LeadStatusOutcome, notes: string) => {
    console.log('Confirmed:', outcome, notes);
    // TODO: dispatch actual update action here
    setModalAction(null);
  };

  // Extract initials for visit-scheduled
  const initials = farmerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="box-border flex flex-row items-center p-5 w-full h-[90px] bg-white border border-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl">
      <div className="flex flex-row items-center gap-4">
        {/* Avatar Background */}
        {isVisitScheduled ? (
          <div className="flex flex-row justify-center items-center p-[9.5px_0px_10.5px] w-12 h-12 bg-[#DCFCE7] rounded-full">
            <span className="font-inter font-bold text-lg leading-7 text-center text-[#15803D]">
              {initials}
            </span>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center p-[9.5px_0px_10.5px] w-12 h-12 bg-[#F0FDF4] rounded-full">
            {/* Using a simple user icon SVG for the generic view */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#059669]">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}

        {/* Text Container */}
        <div className="flex flex-col items-start w-[308.42px]">
          {/* Header Row */}
          <div className="flex flex-row items-center gap-2 h-7 -my-[0.5px]">
            <h2 className="font-inter font-bold text-lg leading-7 text-[#111827]">
              {isVisitScheduled ? farmerName : leadId}
            </h2>
            {!isVisitScheduled && (
              <span className="bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                {status}
              </span>
            )}
          </div>

          {/* Subtitle Row */}
          <div className="flex flex-row items-center gap-2 h-5 mt-1">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#6B7280]" />
              <span className="font-inter font-normal text-sm leading-5 text-[#6B7280]">
                {isVisitScheduled ? location : 'Addis Ababa'}
              </span>
            </span>
            <span className="text-[#D1D5DB]">|</span>
            <span className="flex items-center gap-1">
              {isVisitScheduled ? (
                <>
                  <Phone size={14} className="text-[#6B7280]" />
                  <span className="font-inter font-normal text-sm leading-5 text-[#6B7280]">
                    {phoneNumber}
                  </span>
                </>
              ) : (
                <span className="font-inter font-normal text-sm leading-5 text-[#6B7280]">
                  Created: {createdAt}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons only show for generic view */}
      {!isVisitScheduled && (
        <div className="flex-1 flex justify-end gap-3">
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
        </div>
      )}

      <LeadStatusModal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        onConfirm={handleModalConfirm}
        variant="finalize"
        currentStatus={status}
        leadId={leadId}
        initialOutcome={modalAction === 'reject' ? 'Rejected' : null}
      />
    </div>
  );
}
