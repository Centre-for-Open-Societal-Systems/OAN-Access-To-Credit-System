import { memo } from 'react';
import { Eye, CalendarCheck, XCircle, Calendar } from 'lucide-react';
import { Lead } from '@/features/leads/types/leads.types';

interface LeadActionCellProps {
  lead: Lead;
  navigate: (path: string) => void;
}

// 1.  to prevent re-allocation on every render
const BASE_CLASS = "inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#EDEFF1] bg-white px-4 py-2 text-sm font-semibold text-[#3A474E] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] min-w-[120px] w-auto h-[40px] whitespace-nowrap select-none outline-none";

const BTN_CLASS = `${BASE_CLASS} cursor-pointer transition-all hover:bg-slate-50 active:scale-95`;
const BADGE_CLASS = `${BASE_CLASS} cursor-default`;

const ICON_PROPS = {
  size: 16,
  className: "text-[#3A474E] shrink-0"
} as const;

// 2.  to prevent unnecessary parent-driven row re-renders
const LeadActionCell = memo(({ lead, navigate }: LeadActionCellProps) => {
  const status = lead.status?.toLowerCase();

  switch (status) {
    case 'visit scheduled':
      return (
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => navigate(`/leads/${lead.id.replace('#', '')}/schedule`)}
            className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
          >
            <CalendarCheck {...ICON_PROPS} />
            <span className='text-[14px]'>Visit Scheduled</span>
          </button>
          {lead.visitDate && (
            <span className="inline-flex items-center justify-center gap-1 text-[10px] text-text-muted mt-0.5 w-full">
              <Calendar size={12} className="text-text-muted" />
              <span className="text-[12px] font-normal text-text-muted text-center">{lead.visitDate}</span>
            </span>
          )}
        </div>
      );

    case 'rejected':
      return (
        <span className={BADGE_CLASS}>
          <XCircle {...ICON_PROPS} />
          <span className='text-[14px]'>Rejected</span>
        </span>
      );

    case 'view':
    default:
      return (
        <button
          type="button"
          onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)}
          className={`${BADGE_CLASS} cursor-pointer hover:bg-slate-50 transition-all`}
        >
          <Eye {...ICON_PROPS} />
          <span className='text-[14px]'>View</span>
        </button>
      );
  }
});

LeadActionCell.displayName = 'LeadActionCell';

export default LeadActionCell;
