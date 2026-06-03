import React from 'react';
import { Plus, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoanWelcomeCard() {
  const router = useRouter();

  return (
    <article className="relative flex h-full w-full max-w-4xl flex-col justify-center overflow-hidden rounded-[20px] bg-white p-8 shadow-sm border border-border-subtle">
      {/* Subtle background gradient/orb mimicking the original */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-slate-50 opacity-50 blur-3xl" />
      
      <div className="relative z-10">
        <h2 className="text-[28px] font-bold tracking-tight text-text-primary">
          Loan Application Dashboard
        </h2>
        <p className="mt-2 text-base text-text-muted">
          Review active applications, approvals, and progress status.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/loans/new-loan-application-creation')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#059669] active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Start New Application</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white px-5 py-3 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <ListChecks size={16} strokeWidth={2.5} />
            <span>View My Queue</span>
          </button>
        </div>
      </div>
    </article>
  );
}
