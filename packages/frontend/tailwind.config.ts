import type { Config } from 'tailwindcss';
import path from 'path';

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

export default {
  content: [
    path.join(dir, 'index.html'),
    path.join(dir, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        link: 'var(--color-link)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
        input: 'var(--radius-input)',
      },
      fontSize: {
        xs: ['0.875rem', '1.4'],  // 14px (up from 12px)
        sm: ['1rem', '1.5'],  // 16px (up from 14px)
      },
      maxWidth: {
        prose: '700px',
      },
      boxShadow: {
        'elevation-1': '0 2px 8px rgba(79, 70, 229, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'elevation-2': '0 4px 16px rgba(79, 70, 229, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'elevation-3': '0 8px 32px rgba(79, 70, 229, 0.10), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 16px rgba(79, 70, 229, 0.25)',
        'glow-lg': '0 0 24px rgba(79, 70, 229, 0.35)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
