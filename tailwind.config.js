/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"General Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.7' }],
        lg: ['1.25rem', { lineHeight: '1.5' }],
        xl: ['1.563rem', { lineHeight: '1.4' }],
        '2xl': ['1.953rem', { lineHeight: '1.3' }],
        '3xl': ['2.441rem', { lineHeight: '1.2' }],
        '4xl': ['3.052rem', { lineHeight: '1.1' }],
      },
      colors: {
        paper: { DEFAULT: '#FAFAF8', dark: '#0E0E0E' },
        ink: { DEFAULT: '#111111', dark: '#F5F4EF' },
        muted: { DEFAULT: '#6B6B66', dark: '#8A8A85' },
        border: { DEFAULT: '#E5E3DC', dark: 'rgba(245,244,239,0.12)' },
        tint: { DEFAULT: '#F0EFEA', dark: '#1A1A18' },
        void: '#0A0A0A',
        surface: '#111111',
        'surface-elevated': '#161616',
        fog: '#F5F4EF',
        mist: '#8A8A85',
        gold: {
          DEFAULT: '#D4A854',
          hover: '#C29845',
          muted: 'rgba(212, 168, 84, 0.15)',
        },
        line: 'rgba(245, 244, 239, 0.12)',
        'line-light': 'rgba(245, 244, 239, 0.06)',
        cache: {
          hit: '#5DCAA5',
          miss: '#8A8A85',
          fail: '#E24B4A',
        },
      },
      letterSpacing: {
        headline: '0.04em',
      },
    },
  },
  plugins: [],
}
