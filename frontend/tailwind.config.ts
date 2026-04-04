import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#ffffff',
          surface: '#f8fafc',
          elevated: '#ffffff',
          input: '#f1f5f9',
        },
        brand: {
          primary: '#16a34a',
          glow: 'rgba(22, 163, 74, 0.15)',
          dim: '#15803d',
        },
        accent: {
          amber: '#F5A623',
          rose: '#F0506E',
          blue: '#4A9EFF',
          purple: '#8B6FFF',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#64748b',
          inverse: '#ffffff',
        },
        border: {
          subtle: 'rgba(0,0,0,0.06)',
          active: 'rgba(22, 163, 74, 0.40)',
          strong: 'rgba(0,0,0,0.14)',
        },
        macro: {
          protein: '#4A9EFF',
          carbs: '#F5A623',
          fat: '#F0506E',
          fiber: '#16a34a',
          calories: '#8B6FFF',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        'xs': '0.70rem',
        'sm': '0.813rem',
        'base': '0.938rem',
        'md': '1.063rem',
        'lg': '1.25rem',
        'xl': '1.563rem',
        '2xl': '2rem',
        '3xl': '2.75rem',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.1)',
        'md': '0 4px 16px rgba(0,0,0,0.1)',
        'lg': '0 8px 32px rgba(0,0,0,0.1)',
        'brand': '0 0 0 1px #16a34a, 0 4px 24px rgba(22, 163, 74, 0.15)',
        'teal-glow': '0 0 0 1px rgba(22, 163, 74, 0.2), 0 8px 32px rgba(22, 163, 74, 0.08)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'fade-in': 'fade-in 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slide-up 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'macro-fill': 'macro-fill 600ms ease-out forwards',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'macro-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
