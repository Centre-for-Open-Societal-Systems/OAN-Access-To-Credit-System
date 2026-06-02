import React from 'react';
import { Eye, CalendarPlus, CalendarCheck, Settings, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Lead } from '@/features/leads/types/leads.types';

interface LeadActionCellProps {
  lead: Lead;
  navigate: (path: string) => void;
}

function LeadActionCell({ lead, navigate }: LeadActionCellProps) {
  const commonBtnClass = "inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#EDEFF1] bg-white px-3 py-2 text-xs font-medium text-[#3A474E] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all hover:bg-slate-50 active:scale-95 select-none outline-none";

  switch (lead.actionType) {
    case 'view':
      return (
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)}
            className={`${commonBtnClass} w-[128px] h-[40px]`}
          >
            <Eye size={12} className="text-[#3A474E]" />
            <span>View</span>
          </button>
          {lead.actionNote && (
            <p className="max-w-[128px] text-[10px] leading-snug text-text-muted text-right">{lead.actionNote}</p>
          )}
        </div>
      );



    case 'visit-scheduled':
      return (
        <div className="flex flex-col items-end gap-1">
          <span className={`${commonBtnClass} w-[111.71px] h-[40px] cursor-default`}>
            <CalendarCheck size={12} className="text-[#3A474E]" />
            <span>Visit Scheduled</span>
          </span>
          {lead.visitDate && (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
              <Calendar size={10} className="text-text-muted" />
              <span className="text-[10px] font-normal text-text-muted text-right">{lead.visitDate}</span>
            </span>
          )}
        </div>
      );



    case 'rejected':
      return (
        <div className="flex flex-col items-end gap-1">
          <span className={`${commonBtnClass} w-[128px] h-[40px] cursor-default`}>
            <XCircle size={12} className="text-[#3A474E]" />
            <span>Rejected</span>
          </span>
          {lead.actionNote && (
            <p className="max-w-[128px] text-[10px] leading-snug text-text-muted text-right">{lead.actionNote}</p>
          )}
        </div>
      );

    default:
      return (
        <button
          type="button"
          onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)}
          className={`${commonBtnClass} w-[128px] h-[40px]`}
        >
          <Eye size={12} className="text-[#3A474E]" />
          <span>View</span>
        </button>
      );
  }
}

export default LeadActionCell;
