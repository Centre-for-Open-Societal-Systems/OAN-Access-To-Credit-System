import { Phone, TrendingUp, TrendingDown, Minus, FileText, CheckCircle2, XCircle, Users, CheckCircle } from 'lucide-react';

function getKpiIconCfg(id) {
  switch (id) {
    case 'total':     return { bg: 'bg-blue-500',   icon: <Users        size={22} className="text-white" /> };
    case 'initiated': return { bg: 'bg-violet-500', icon: <Phone        size={22} className="text-white" /> };
    case 'qualified': return { bg: 'bg-green-500',  icon: <CheckCircle2 size={22} className="text-white" /> };
    case 'processed': return { bg: 'bg-teal-500',   icon: <CheckCircle  size={22} className="text-white" /> };
    case 'rejected':  return { bg: 'bg-red-500',    icon: <XCircle      size={22} className="text-white" /> };
    default:          return { bg: 'bg-slate-500',  icon: <FileText     size={22} className="text-white" /> };
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
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        {cfg.icon}
      </div>
    </div>
  );
}

export default LeadKpiCard;
