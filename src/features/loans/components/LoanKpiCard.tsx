import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectLiveMetrics } from '../store/loanDashboardSlice';

export interface MetricConfig {
  icon: LucideIcon;
  tone: string;
  label: React.ReactNode;
  key: 'total' | 'processing' | 'approved' | 'rejected';
}

interface LoanKpiCardProps {
  cfg: MetricConfig;
  index?: number;
}

const LoanKpiCard = React.memo(({ cfg, index = 0 }: LoanKpiCardProps) => {
  const liveMetrics = useAppSelector(selectLiveMetrics);
  const stat = liveMetrics[cfg.key];

  const Icon = cfg.icon;

  const toneStyles: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <article 
      className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-card-rise"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate mb-1 text-base font-medium text-gray-500 transition-colors group-hover:text-gray-700">
            {cfg.label}
          </span>
          <strong className="truncate text-[36px] leading-none font-bold text-gray-900 mt-2">
            {stat.value}
          </strong>
        </div>

        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${toneStyles[cfg.tone] || toneStyles.blue}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
      </div>
    </article>
  );
});

LoanKpiCard.displayName = 'LoanKpiCard';
export default LoanKpiCard;
