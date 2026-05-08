function LeadLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading leads">
      {/* Header card skeleton */}
      <section className="animate-pulse rounded-[28px] border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="h-5 w-28 rounded-full bg-slate-200" />
            <div className="h-9 w-64 rounded-2xl bg-slate-200" />
            <div className="h-4 w-96 max-w-full rounded-xl bg-slate-200" />
          </div>
          <div className="h-11 w-28 rounded-2xl bg-slate-200" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-page p-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="h-8 w-8 rounded-xl bg-slate-200" />
              </div>
              <div>
                <div className="h-9 w-16 rounded-xl bg-slate-200" />
                <div className="mt-2 h-3 w-36 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toolbar skeleton */}
      <div className="animate-pulse rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="h-5 w-48 rounded-full bg-slate-200" />
          <div className="h-8 w-32 rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="animate-pulse overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
        <div className="border-b border-border-subtle bg-page p-4">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-border-subtle p-4 last:border-0">
            <div className="grid grid-cols-7 items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-200" />
              </div>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-4 rounded-full bg-slate-200" />
              ))}
              <div className="h-7 w-16 rounded-xl bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeadLoadingSkeleton;
