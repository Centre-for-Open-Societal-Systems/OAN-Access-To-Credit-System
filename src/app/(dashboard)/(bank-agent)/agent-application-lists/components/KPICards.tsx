'use client';

import { selectBankMetrics, selectBankStageCards } from '@/features/loans/store/bankApplicationsSlice';
import { useAppSelector } from '@/store/hooks';
import { Award, CheckCircle2, Clock, FileCheck, FileText, LucideIcon, Users, XCircle } from 'lucide-react';
import { useCarouselScroll } from '@/hooks/useCarouselScroll';
import { MotionEffect } from '@/components/motion/MotionEffect';

function getStageCardIcon(label: string, archetype?: string): { icon: LucideIcon; iconBgColor: string; iconColor: string } {
  const lower = label.toLowerCase();
  if (lower.includes('submit')) {
    return { icon: FileText, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' };
  }
  if (lower.includes('verif') || lower.includes('doc') || lower.includes('kyc')) {
    return { icon: FileCheck, iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-500' };
  }
  if (lower.includes('underwrit') || lower.includes('review') || lower.includes('process')) {
    return { icon: Clock, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' };
  }
  if (lower.includes('approv') || lower.includes('grant') || lower.includes('sanction')) {
    return { icon: CheckCircle2, iconBgColor: 'bg-emerald-100', iconColor: 'text-emerald-500' };
  }
  if (lower.includes('disburs') || lower.includes('complet')) {
    return { icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (lower.includes('reject') || lower.includes('declin') || lower.includes('cancel')) {
    return { icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' };
  }
  if (archetype === 'Completed') {
    return { icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (archetype === 'Rejected' || archetype === 'Cancelled') {
    return { icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' };
  }
  return { icon: FileText, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' };
}

/**
 * Stage counts and metrics for the bank applications portal.
 * Showcases the bank-specific loan stages dynamically with live counts from summary.
 */
export default function StatCards() {
  const metrics = useAppSelector(selectBankMetrics);
  const stageCards = useAppSelector(selectBankStageCards);
  const { scrollRef, activeIndex, scrollTo } = useCarouselScroll({ enableWheelScroll: true });

  const hasStages = stageCards && stageCards.length > 0;
  const cardsData = hasStages
    ? [
      { key: 'total_applications', label: 'Total Applications', value: metrics.total, icon: Users, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
      ...stageCards.map((card) => {
        const { icon, iconBgColor, iconColor } = getStageCardIcon(card.label, card.archetype);
        return {
          key: card.key,
          label: card.label,
          value: card.value,
          icon,
          iconBgColor,
          iconColor,
        };
      })
    ]
    : [
      { key: 'total_applications', label: 'Total Applications', value: metrics.total, icon: Users, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
      { key: 'in_progress', label: 'In Progress', value: metrics.inTransition, icon: FileText, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' },
      { key: 'completed', label: 'Completed', value: metrics.completed, icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' },
      { key: 'cancelled', label: 'Cancelled', value: metrics.cancelled, icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' },
    ];

  const totalCards = cardsData.length;

  return (
    <div className="relative mb-6">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .hide-scrollbar::-webkit-scrollbar-track { display: none !important; }
        .hide-scrollbar::-webkit-scrollbar-thumb { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar pb-2 px-1"
      >
        {cardsData.map((card, index) => (
          <MotionEffect
            key={card.key || `${card.label}-${index}`}
            delay={index * 70}
            slide={{ direction: 'up', offset: 14 }}
            className="group w-[85vw] sm:w-[280px] shrink-0 snap-center bg-white border border-[#F1F3F4] rounded-xl p-5 flex items-center justify-between shadow-sm shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#6B7280] mb-1">{card.label}</p>
              <h4 className="text-[32px] font-bold text-[#1F2937] leading-none">{card.value}</h4>
            </div>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md ${card.iconBgColor}`}>
              <card.icon size={32} className={`${card.iconColor} transition-transform duration-300`} />
            </div>
          </MotionEffect>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {totalCards > 1 && Array.from({ length: Math.min(totalCards, 3) }).map((_, dotIndex) => {
          const numDots = Math.min(totalCards, 3);
          const chunkSize = Math.max(1, Math.round(totalCards / numDots));
          const activeDot = Math.min(numDots - 1, Math.floor(activeIndex / chunkSize));
          const isActive = activeDot === dotIndex;

          return (
            <button
              key={dotIndex}
              type="button"
              onClick={() => scrollTo(dotIndex * chunkSize)}
              className={`transition-all duration-300 rounded-full ${isActive
                ? 'bg-[#16A34A] w-6 h-2'
                : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                }`}
              aria-label={`Go to page ${dotIndex + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
