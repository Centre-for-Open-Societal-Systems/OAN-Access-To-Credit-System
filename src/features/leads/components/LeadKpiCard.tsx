import { TrendingUp, TrendingDown, Minus, FileText, CheckCircle2, XCircle, Users, CheckCircle, ClipboardList, FileCheck, Clock } from 'lucide-react';
import { KpiStat } from '@/features/leads/types/leads.types';

interface LeadKpiCardProps {
  stat: KpiStat;
  index: number;
}

function getKpiIconCfg(id: string) {
  switch (id) {
    case 'total': return { bg: 'bg-blue-100', icon: <Users size={28} className="text-blue-500" /> };
    case 'active': return { bg: 'bg-violet-100', icon: <ClipboardList size={28} className="text-violet-500" /> };
    case 'verified': return { bg: 'bg-green-100', icon: <CheckCircle2 size={28} className="text-green-500" /> };
    case 'processed': return { bg: 'bg-teal-100', icon: <FileCheck size={28} className="text-teal-500" /> };
    case 'granted': return { bg: 'bg-amber-100', icon: <Clock size={28} className="text-amber-500" /> };
    case 'rejected': return { bg: 'bg-red-100', icon: <XCircle size={28} className="text-red-500" /> };
    case 'dormant': return { bg: 'bg-amber-100', icon: <Clock size={28} className="text-amber-500" /> };
    default: return { bg: 'bg-slate-100', icon: <FileText size={28} className="text-slate-500" /> };
  }
}

function LeadKpiCard({ stat, index }: LeadKpiCardProps) {
  const cfg = getKpiIconCfg(stat.id);
  const TrendIcon = stat.trendUp === true ? TrendingUp : stat.trendUp === false ? TrendingDown : Minus;

  const trendPill = stat.trendUp === true
    ? 'bg-green-100 text-green-700'
    : stat.trendUp === false
      ? 'bg-red-100 text-red-600'
      : 'bg-orange-100 text-orange-600';

  const trendVal = stat.trend != null ? Number(stat.trend) : 0;

  return (
    <div
      className="relative bg-white border border-[#e9e9e9] rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden flex items-start justify-between"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div>
        <p className="text-sm text-text-muted">{stat.label}</p>
        <p className="mt-1.5 text-3xl font-bold text-text-primary">{stat.display}</p>
      </div>
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        {cfg.icon}
      </div>
    </div>
  );
}

export default LeadKpiCard;
