import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
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
        button: 'var(--button-bg)',
        'button-hover': 'var(--button-bg-hover)',
      },
      spacing: {
        'table-cell': '151.71px',
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
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-up':   'fade-in-up 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-left': 'fade-in-left 0.42s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':     'scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'badge-pop':    'badge-pop 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'card-rise':    'card-rise 0.35s cubic-bezier(0.22,0.68,0,1.2) both',
        float:          'float 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
