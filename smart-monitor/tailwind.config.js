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
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
        // Scroll-triggered entrance animations
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        slideInLeft: {
          from: { opacity: 0, transform: 'translateX(-16px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: 0, transform: 'translateX(16px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        rise: 'rise 0.35s ease-out forwards',
        traceIn: 'traceIn 1.8s ease-out forwards',
        fadeUp: 'fadeUp 0.45s cubic-bezier(0.4,0,0.2,1) forwards',
        fadeIn: 'fadeIn 0.35s ease-out forwards',
        scaleIn: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        slideInLeft: 'slideInLeft 0.4s cubic-bezier(0.4,0,0.2,1) forwards',
        slideInRight: 'slideInRight 0.4s cubic-bezier(0.4,0,0.2,1) forwards',
        slideIn: 'slideIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
