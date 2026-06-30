import { FileText, CheckCircle2, XCircle, Users, ClipboardList, FileCheck, Clock } from 'lucide-react';
import { KpiStat } from '@/features/leads/types/leads.types';

interface LeadKpiCardProps {
  stat: KpiStat;
  index: number;
}

function getKpiIconCfg(id: string) {
  switch (id) {
    case 'total': return { bg: 'bg-blue-100', icon: <Users size={28} className="text-blue-500" /> };
    case 'active': return { bg: 'bg-green-100', icon: <ClipboardList size={28} className="text-green-500" /> };
    case 'verified': return { bg: 'bg-teal-100', icon: <CheckCircle2 size={28} className="text-teal-500" /> };
    case 'processed': return { bg: 'bg-cyan-100', icon: <FileCheck size={28} className="text-cyan-500" /> };
    case 'rejected': return { bg: 'bg-red-100', icon: <XCircle size={28} className="text-red-500" /> };
    case 'dormant': return { bg: 'bg-orange-100', icon: <Clock size={28} className="text-orange-500" /> };
    default: return { bg: 'bg-slate-100', icon: <FileText size={28} className="text-slate-500" /> };
  }
}

function LeadKpiCard({ stat, index }: LeadKpiCardProps) {
  const cfg = getKpiIconCfg(stat.id);

  return (
    <div
      className="relative h-full bg-white border border-[#e9e9e9] rounded-2xl shadow-sm p-3.5 sm:p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden flex items-center justify-between gap-2"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex-1">
        <p className="text-text-muted font-bold text-base sm:text-lg">{stat.label}</p>
        <p className="mt-1 sm:mt-1.5 text-2xl sm:text-3xl font-bold text-text-primary">{stat.display}</p>
      </div>
      <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        {cfg.icon}
      </div>
    </div>
  );
}

export default LeadKpiCard;
