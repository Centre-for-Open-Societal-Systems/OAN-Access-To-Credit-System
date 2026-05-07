module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
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
      fontFamily: {
        body: ['"DM Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        elevated: '0 30px 80px rgba(18, 31, 54, 0.16)',
      },
      backgroundImage: {
        'hero-orb': 'radial-gradient(circle at top, rgba(255, 255, 255, 0.14), transparent 68%)',
      },
    },
  },
  plugins: [],
};
