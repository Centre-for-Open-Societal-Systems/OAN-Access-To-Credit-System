import { RefreshCcw } from 'lucide-react';

function UpdateLoanStatus() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-[28px] border border-border-subtle bg-surface p-10 text-center shadow-sm">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border-subtle bg-page text-text-muted">
        <RefreshCcw size={28} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          Update Loan Status
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          This page is under construction. The status management workflow will be available here
          soon.
        </p>
      </div>
    </div>
  );
}

export default UpdateLoanStatus;
