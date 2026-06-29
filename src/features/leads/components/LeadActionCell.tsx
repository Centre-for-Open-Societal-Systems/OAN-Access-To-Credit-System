import { memo } from 'react';
import { Eye, XCircle, Calendar, CheckCircle } from 'lucide-react';
import { Lead } from '@/features/leads/types/leads.types';

interface LeadActionCellProps {
  lead: Lead;
  navigate: (path: string) => void;
}

// 1.  to prevent re-allocation on every render
const BASE_CLASS = "inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#EDEFF1] bg-white px-4 py-2 text-sm font-semibold text-[#3A474E] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] min-w-[120px] w-auto h-[40px] whitespace-nowrap select-none outline-none";

const BADGE_CLASS = `${BASE_CLASS} cursor-default`;

const ICON_PROPS = {
  size: 16,
  className: "text-[#3A474E] shrink-0"
} as const;

// Visit state logic
// A lead needs a visit schedule if its latest schedule was missed.
export function needsVisitSchedule(lead: Lead): boolean {
  const status = lead.status?.toLowerCase();
  const scheduleStatus = lead.scheduleStatus?.toLowerCase();
  return scheduleStatus === 'missed' && (status === 'active' || status === 'verified');
}

// A lead has an active visit scheduled if it has a visit date or its status is scheduled,
// and it's not currently in a 'missed' state.
export function hasVisitScheduled(lead: Lead): boolean {
  const status = lead.status?.toLowerCase();
  const scheduleStatus = lead.scheduleStatus?.toLowerCase();
  
  const hasVisit = Boolean(lead.visitDate) || scheduleStatus === 'scheduled';
  return hasVisit && scheduleStatus !== 'missed' && (status === 'active' || status === 'verified');
}

// @ts-ignore (disable lint warning for unused variable, or remove if unused)
export function getLeadRoute(lead: Lead): string {
  const detailRoute = `/leads/${lead.id.replace('#', '')}`;
  // Only route to the schedule page if a visit NEEDS to be scheduled (i.e. missed)
  return needsVisitSchedule(lead) ? `${detailRoute}/schedule` : detailRoute;
}

// 2.  to prevent unnecessary parent-driven row re-renders
const LeadActionCell = memo(({ lead, navigate }: LeadActionCellProps) => {
  const status = lead.status?.toLowerCase();

  if (needsVisitSchedule(lead)) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => navigate(getLeadRoute(lead))}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <Calendar {...ICON_PROPS} />
          <span className='text-[14px]'>Schedule Visit</span>
        </button>
        {lead.visitDate && (
          <span className="inline-flex items-center justify-center gap-1 text-[10px] text-text-muted mt-0.5 w-full">
            <span className="text-[12px] font-normal text-red-500 text-center">Missed: {lead.visitDate.split(' ')[0]}</span>
          </span>
        )}
      </div>
    );
  }

  if (hasVisitScheduled(lead)) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => navigate(getLeadRoute(lead))}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <Eye {...ICON_PROPS} />
          <span className='text-[14px]'>View</span>
        </button>
        {lead.visitDate && (
          <span className="inline-flex items-center justify-center gap-1 text-[10px] text-text-muted mt-0.5 w-full">
            <Calendar size={10} className="text-text-muted" />
            <span className="text-[12px] font-normal text-text-muted text-center">{lead.visitDate.split(' ')[0]}</span>
          </span>
        )}
      </div>
    );
  }

  switch (status) {

    case 'rejected':
      return (
        <button
          type="button"
          onClick={() => navigate(getLeadRoute(lead))}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <XCircle {...ICON_PROPS} />
          <span className='text-[14px]'>Rejected</span>
        </button>
      );

    case 'granted':
      return (
        <button
          type="button"
          onClick={() => navigate(getLeadRoute(lead))}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <CheckCircle {...ICON_PROPS} className="text-[#10B981] shrink-0" />
          <span className='text-[14px]'>Granted</span>
        </button>
      );

    case 'view':
    default:
      return (
        <button
          type="button"
          onClick={() => navigate(getLeadRoute(lead))}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <Eye {...ICON_PROPS} />
          <span className='text-[14px]'>View</span>
        </button >
      );
  }
});

LeadActionCell.displayName = 'LeadActionCell';

export default LeadActionCell;
