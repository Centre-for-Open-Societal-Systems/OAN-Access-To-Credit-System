function Button({ children, variant = 'primary', type = 'button', className = '', ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition';

  const variants = {
    primary: 'bg-button text-white shadow-sm hover:bg-button-hover',
    secondary:
      'border border-border-subtle bg-white text-text-primary hover:border-slate-300 hover:bg-slate-50',
    ghost: 'text-text-muted hover:bg-slate-100 hover:text-text-primary',
  };

  return (
    <button type={type} className={`${base} ${variants[variant] ?? ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export default Button;
