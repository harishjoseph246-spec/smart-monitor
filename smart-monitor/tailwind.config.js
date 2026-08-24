/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050B12',
          900: '#081420',
          800: '#0D1D2C',
          700: '#12283B',
          600: '#1A3550',
          500: '#254768',
        },
        electric: {
          400: '#5B9BFF',
          500: '#2E6BFF',
          600: '#1D4FDB',
        },
        signal: '#37E2C4',
        good: '#22C55E',
        warn: '#F5A623',
        crit: '#EF4444',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        glow: '0 0 0 3px rgba(59,130,246,0.15)',
        'glow-red': '0 0 0 3px rgba(239,68,68,0.15)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        rise: {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        traceIn: {
          from: { strokeDashoffset: '600' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        rise: 'rise 0.35s ease-out forwards',
        traceIn: 'traceIn 1.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
