import React from 'react';
import { Eye, CalendarPlus, CalendarCheck, Settings, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Lead } from '@/types/leads.types';

interface LeadActionCellProps {
  lead: Lead;
  navigate: (path: string) => void;
}

function LeadActionCell({ lead, navigate }: LeadActionCellProps) {
  switch (lead.actionType) {
    case 'view':
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-green-600 bg-white px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50 active:scale-95"
          >
            <Eye size={14} />
            View
          </button>
          {lead.actionNote && (
            <p className="max-w-[200px] text-xs leading-snug text-text-muted">{lead.actionNote}</p>
          )}
        </div>
      );

    case 'schedule-visit':
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigate(`/leads/${lead.id.replace('#', '')}/schedule`)}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 active:scale-95"
          >
            <CalendarPlus size={14} />
            Schedule Visit
          </button>
          {lead.visitDate && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Calendar size={12} />
              {lead.visitDate}
            </span>
          )}
        </div>
      );

    case 'visit-scheduled':
      return (
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-sm font-medium text-blue-700">
            <CalendarCheck size={14} />
            Visit Scheduled
          </span>
          {lead.visitDate && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Calendar size={12} />
              {lead.visitDate}
            </span>
          )}
        </div>
      );

    case 'application-processing':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500 bg-white px-3 py-1.5 text-sm font-medium text-amber-700">
          <Settings size={14} className="text-amber-500" />
          Application Processing
        </span>
      );

    case 'application-submitted':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700">
          <CheckCircle size={14} className="text-emerald-500" />
          Application Submitted
        </span>
      );

    case 'rejected':
      return (
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-red-400 bg-white px-3 py-1.5 text-sm font-medium text-red-600">
            <XCircle size={14} />
            Rejected
          </span>
          {lead.actionNote && (
            <p className="max-w-[200px] text-xs leading-snug text-text-muted">{lead.actionNote}</p>
          )}
        </div>
      );

    default:
      return (
        <button
          type="button"
          onClick={() => navigate(`/leads/${lead.id.replace('#', '')}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-600 bg-white px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50"
        >
          <Eye size={14} />
          View
        </button>
      );
  }
}

export default LeadActionCell;
