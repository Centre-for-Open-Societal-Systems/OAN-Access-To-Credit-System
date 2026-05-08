import { FilePlus } from 'lucide-react';

function NewLeadCreation() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-[28px] border border-border-subtle bg-surface p-10 text-center shadow-sm">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border-subtle bg-page text-text-muted">
        <FilePlus size={28} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          New Lead Creation
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          This page is under construction. The lead intake form will be available here soon.
        </p>
      </div>
    </div>
  );
}

export default NewLeadCreation;
