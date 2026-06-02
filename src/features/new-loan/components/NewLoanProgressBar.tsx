import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

export const STEPS = [
  { number: 1, label: 'Consent & Supporting Documents' },
  { number: 2, label: 'Farmer Details' },
  { number: 3, label: 'Review Application' },
];

export function NewLoanProgressBar({ currentStep, onStepClick }: { currentStep: number; onStepClick?: (step: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const inner = container.children[0] as HTMLElement;
      if (inner && inner.children[currentStep - 1]) {
        const activeStepEl = inner.children[currentStep - 1] as HTMLElement;
        const scrollLeft = activeStepEl.offsetLeft - (container.clientWidth / 2) + (activeStepEl.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentStep]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#16A34A]/50 transition-all duration-300 sm:px-6 overflow-x-auto" ref={containerRef}>
      <div className="flex items-start gap-0 min-w-[500px] md:min-w-0">
        {STEPS.map(step => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          return (
            <div key={step.number} onClick={() => isDone && onStepClick && onStepClick(step.number)} className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 group ${isDone ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
              <div className="flex w-full items-center">
                <div className={`h-1 flex-1 transition-all duration-500 rounded-r-full ${step.number === 1 ? 'opacity-0' : isDone || isActive ? 'bg-gradient-to-r from-[#16A34A] to-[#10883c] shadow-[0_0_8px_rgba(22,163,74,0.4)]' : 'bg-gray-200'}`} />
                <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 z-10 
                  ${isActive ? 'border-2 border-[#16335A] bg-white text-[#16335A] shadow-[0_0_12px_rgba(22,51,90,0.3)] scale-110' : 
                    isDone ? 'border-2 border-[#16A34A] bg-[#16A34A] text-white scale-100' : 'border-2 border-gray-200 bg-white text-gray-400'}`}>
                  {isDone ? <Check size={14} strokeWidth={3} className="animate-in zoom-in" /> : step.number}
                  {isActive && <span className="absolute -inset-1.5 rounded-full border border-[#16335A]/20 animate-ping" style={{ animationDuration: '3s' }} />}
                </span>
                <div className={`h-1 flex-1 transition-all duration-500 rounded-l-full ${step.number === STEPS.length ? 'opacity-0' : isDone ? 'bg-gradient-to-r from-[#10883c] to-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.4)]' : 'bg-gray-200'}`} />
              </div>
              <div className="text-center mt-1">
                <p className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${isActive ? 'text-[#16335A]' : isDone ? 'text-[#16A34A]' : 'text-gray-400'}`}>Step {step.number}</p>
                <p className={`text-xs mt-0.5 transition-colors ${isActive ? 'font-semibold text-gray-900' : isDone ? 'font-medium text-gray-700' : 'text-gray-400'}`}>{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
