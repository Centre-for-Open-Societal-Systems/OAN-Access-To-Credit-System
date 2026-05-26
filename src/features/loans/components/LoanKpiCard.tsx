import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricConfig {
  icon: LucideIcon;
  helperIcon: LucideIcon;
  tone: string;
  label: string;
  helper: string;
}

interface MetricStat {
  value: string;
  trend: string;
  dir: 'up' | 'down';
}

interface LoanKpiCardProps {
  cfg: MetricConfig;
  stat: MetricStat;
}

/**
 * KPI metric card used in LoanApplicationDashboard.
 * Uses global dashboard SCSS classes (kpi-card, kpi-card__*).
 */
function LoanKpiCard({ cfg, stat }: LoanKpiCardProps) {
  const Icon       = cfg.icon;
  const HelperIcon = cfg.helperIcon;
  const TrendIcon  = stat.dir === 'up' ? TrendingUp : TrendingDown;

  return (
    <article className="dashboard-card kpi-card">
      <span className={`kpi-card__trend-badge kpi-card__trend-badge--${stat.dir}`}>
        <TrendIcon size={11} strokeWidth={2.5} />
        {stat.trend}
      </span>

      <div className="kpi-card__body">
        <div className={`kpi-card__icon-box kpi-card__icon-box--${cfg.tone}`}>
          <Icon size={36} strokeWidth={1.6} />
        </div>

        <div className="kpi-card__text">
          <strong className="kpi-card__value">{stat.value}</strong>
          <span className="kpi-card__label">{cfg.label}</span>
        </div>
      </div>

      <div className="kpi-card__helper">
        <HelperIcon size={12} strokeWidth={2} />
        <span>{cfg.helper}</span>
      </div>
    </article>
  );
}

export default LoanKpiCard;
