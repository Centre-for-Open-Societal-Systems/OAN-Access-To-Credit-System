import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectLiveMetrics } from '../store/loanDashboardSlice';

interface MetricConfig {
  icon: LucideIcon;
  helperIcon: LucideIcon;
  tone: string;
  label: string;
  helper: string;
  key: string;
}

interface LoanKpiCardProps {
  cfg: MetricConfig;
}

const LoanKpiCard = React.memo(({ cfg }: LoanKpiCardProps) => {
  const liveMetrics = useAppSelector(selectLiveMetrics);
  const stat = (liveMetrics as any)[cfg.key] || { value: '0', trend: '0%', dir: 'up' };

  const Icon       = cfg.icon;
  const HelperIcon = cfg.helperIcon;
  const TrendIcon  = stat.dir === 'up' ? TrendingUp : TrendingDown;

  return (
    <article className="relative flex flex-col justify-between rounded-[20px] border border-border-subtle bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          cfg.tone === 'blue' ? 'bg-blue-50 text-blue-600' :
          cfg.tone === 'green' ? 'bg-green-50 text-green-600' :
          cfg.tone === 'amber' ? 'bg-amber-50 text-amber-600' :
          'bg-red-50 text-red-600'
        }`}>
          <Icon size={24} strokeWidth={2} />
        </div>

        <div className="flex min-w-0 flex-col items-end">
          {stat.trend && (
            <span className={`mb-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${stat.dir === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <TrendIcon size={12} strokeWidth={3} />
              {stat.trend}
            </span>
          )}
          <strong className="truncate text-[32px] leading-tight font-bold text-slate-900 max-w-full">
            {stat.value}
          </strong>
          <span className="truncate mt-0.5 text-[13px] font-medium text-slate-500 max-w-full">
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="mt-5 flex w-full items-center justify-end gap-1.5 border-t border-border-subtle pt-3 text-xs text-slate-400">
        <HelperIcon size={14} strokeWidth={2} />
        <span>{cfg.helper}</span>
      </div>
    </article>
  );
});

LoanKpiCard.displayName = 'LoanKpiCard';
export default LoanKpiCard;
