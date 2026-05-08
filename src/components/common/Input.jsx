function Input({ label, id, className = '', ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">
          {label}
        </span>
      )}
      <input
        id={id}
        className={`w-full rounded-2xl border border-border-subtle bg-page px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60 ${className}`}
        {...rest}
      />
    </label>
  );
}

export default Input;
