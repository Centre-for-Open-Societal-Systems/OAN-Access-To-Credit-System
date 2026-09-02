import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--page-bg)',
        surface: 'var(--surface)',
        'surface-strong': 'var(--surface-strong)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'border-subtle': 'var(--border-subtle)',
        panel: 'var(--panel-bg)',
        'panel-deep': 'var(--panel-bg-deep)',
        'panel-soft': 'var(--panel-soft)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        success: 'var(--success)',
        // Portal/login brand greens. The values already existed as CSS variables
        // in styles/variables.scss but were being written as raw hex (bg-[#16A34A])
        // in ~300 places; new code uses these tokens so the palette is one edit.
        'brand-green': 'var(--color-green-primary)',
        'brand-green-hover': 'var(--color-green-hover)',
        'brand-green-strong': 'var(--color-green-text)',
        'brand-green-surface': 'var(--color-green-light-bg)',
        'brand-green-border': 'var(--color-green-light-hover)',
        button: 'var(--button-bg)',
        'button-hover': 'var(--button-bg-hover)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      spacing: {
        'table-cell': '151.71px',
      },
      zIndex: {
        dropdown: '100',
        sticky: '200',
        popover: '300',
        overlay: '400',
        modal: '500',
        toast: '600',
        max: '9999',
      },
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      boxShadow: {
        elevated: '0 30px 80px rgba(18, 31, 54, 0.16)',
      },
      backgroundImage: {
        'hero-orb': 'radial-gradient(circle at top, rgba(255, 255, 255, 0.14), transparent 68%)',
      },
      keyframes: {
        'fade-in-down': {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-14px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'badge-pop': {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '70%':  { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'card-rise': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        // ── Global loader / progress bar ──────────────────────────────────
        // Kept here rather than as one-off inline styles so every loading
        // surface in the app (route boundaries, the top bar, the sign-out
        // overlay) animates on exactly the same curves.
        'loader-spin': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'loader-spin-reverse': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'loader-halo': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.86)' },
          '50%':      { opacity: '0.9',  transform: 'scale(1.06)' },
        },
        // Travels across the viewport and back without ever claiming a
        // percentage it can't know — an honest indeterminate bar.
        'progress-sweep': {
          '0%':   { transform: 'translateX(-100%) scaleX(0.35)' },
          '55%':  { transform: 'translateX(30%) scaleX(0.7)' },
          '100%': { transform: 'translateX(100%) scaleX(0.4)' },
        },
        'progress-out': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // Route transition for the dashboard content region. Small on purpose:
        // this fires on every navigation, so anything larger stops reading as
        // responsiveness and starts reading as latency.
        'page-enter': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-up':   'fade-in-up 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-left': 'fade-in-left 0.42s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':     'scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'badge-pop':    'badge-pop 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'card-rise':    'card-rise 0.35s cubic-bezier(0.22,0.68,0,1.2) both',
        float:          'float 3.2s ease-in-out infinite',
        'loader-spin':         'loader-spin 0.85s linear infinite',
        'loader-spin-reverse': 'loader-spin-reverse 1.4s linear infinite',
        'loader-halo':         'loader-halo 1.6s ease-in-out infinite',
        'progress-sweep':      'progress-sweep 1.15s cubic-bezier(0.65,0,0.35,1) infinite',
        'progress-out':        'progress-out 0.4s ease-out forwards',
        'page-enter':          'page-enter 0.32s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
