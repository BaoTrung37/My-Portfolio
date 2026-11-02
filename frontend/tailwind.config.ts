import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          subtle: '#eff6ff',
        },
        success: {
          DEFAULT: '#16a34a',
          bg: '#f0fdf4',
        },
        error: {
          DEFAULT: '#dc2626',
          bg: '#fef2f2',
        },
        warning: {
          DEFAULT: '#d97706',
          bg: '#fffbeb',
        },
        neutral: {
          title: '#0f172a',
          secondary: '#475569',
          placeholder: '#94a3b8',
          divider: '#e2e8f0',
        },
        container: '#ffffff',
        layout: '#f8fafc',
      },
      fontSize: {
        h4: ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        h6: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'subtitle-1': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'body-1': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        caption: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};

export default config;
