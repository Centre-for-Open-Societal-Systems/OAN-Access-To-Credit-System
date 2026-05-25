import { Phone, TrendingUp, TrendingDown, Minus, FileText, CheckCircle2, XCircle, Users, CheckCircle } from 'lucide-react';

function getKpiIconCfg(id) {
  switch (id) {
    case 'total':     return { bg: 'bg-blue-100',   icon: <Users        size={28} className="text-blue-500" /> };
    case 'initiated': return { bg: 'bg-violet-100', icon: <Phone        size={28} className="text-violet-500" /> };
    case 'qualified': return { bg: 'bg-green-100',  icon: <CheckCircle2 size={28} className="text-green-500" /> };
    case 'processed': return { bg: 'bg-teal-100',   icon: <CheckCircle  size={28} className="text-teal-500" /> };
    case 'rejected':  return { bg: 'bg-red-100',    icon: <XCircle      size={28} className="text-red-500" /> };
    default:          return { bg: 'bg-slate-100',  icon: <FileText     size={28} className="text-slate-500" /> };
  }
}

function LeadKpiCard({ stat, index }) {
  const cfg       = getKpiIconCfg(stat.id);
  const TrendIcon = stat.up === true ? TrendingUp : stat.up === false ? TrendingDown : Minus;
  const trendPill = stat.up === true
    ? 'bg-green-100 text-green-700'
    : stat.up === false
    ? 'bg-red-100 text-red-600'
    : 'bg-orange-100 text-orange-600';
  return (
    <div
      className="relative bg-white border border-[#e9e9e9] rounded-2xl shadow-sm p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden flex items-start justify-between"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div>
        <p className="text-sm text-text-muted">{stat.label}</p>
        <p className="mt-1.5 text-3xl font-bold text-text-primary">{stat.display}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${trendPill}`}>
            <TrendIcon size={11} strokeWidth={2.5} />
            {stat.trend.toFixed(1)}%
          </span>
          <span className="text-xs text-text-muted">vs last month</span>
        </div>
      </div>
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        {cfg.icon}
      </div>
    </div>
  );
}

export default LeadKpiCard;
