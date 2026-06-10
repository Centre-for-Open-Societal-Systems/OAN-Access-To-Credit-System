import { memo } from 'react';
import { Eye, CalendarCheck, XCircle, Calendar } from 'lucide-react';
import { Lead } from '@/features/leads/types/leads.types';

interface LeadActionCellProps {
  lead: Lead;
  navigate: (path: string) => void;
}

// 1.  to prevent re-allocation on every render
const BASE_CLASS = "inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#EDEFF1] bg-white px-3 py-2 text-xs font-medium text-[#3A474E] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] w-[111.71px] h-[40px] select-none outline-none";

const BTN_CLASS = `${BASE_CLASS} cursor-pointer transition-all hover:bg-slate-50 active:scale-95`;
const BADGE_CLASS = `${BASE_CLASS} cursor-default`;

const ICON_PROPS = {
  size: 12,
  className: "text-[#3A474E]"
} as const;

export function getLeadRoute(lead: Lead): string {
  const status = lead.status?.toLowerCase();
  if (status === 'verified' && lead.visitDate) {
    return `/leads/${lead.id.replace('#', '')}/schedule`;
  }
  return `/leads/${lead.id.replace('#', '')}`;
}

// 2.  to prevent unnecessary parent-driven row re-renders
const LeadActionCell = memo(({ lead, navigate }: LeadActionCellProps) => {
  const status = lead.status?.toLowerCase();

  if (status === 'verified' && lead.visitDate) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => navigate(getLeadRoute(lead))}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <CalendarCheck {...ICON_PROPS} />
          <span>Visit Scheduled</span>
        </button>
        <span className="inline-flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
          <Calendar size={10} className="text-text-muted" />
          <span className="text-[10px] font-normal text-text-muted text-right">{lead.visitDate}</span>
        </span>
      </div>
    );
  }

  switch (status) {

    case 'rejected':
      return (
        <span className={BADGE_CLASS}>
          <XCircle {...ICON_PROPS} />
          <span>Rejected</span>
        </span>
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
          <span>View</span>
        </button>
      );
  }
});

LeadActionCell.displayName = 'LeadActionCell';

export default LeadActionCell;
