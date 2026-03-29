import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006BFF',
          dark: '#0052CC',
          light: '#E8F0FE',
        },
        success: {
          DEFAULT: '#00C48C',
          light: '#E6FAF5',
        },
        danger: {
          DEFAULT: '#FF4B4B',
          light: '#FFF0F0',
        },
        warning: {
          DEFAULT: '#FFB020',
          light: '#FFF8E6',
        },
        sidebar: '#0A1628',
        surface: '#FFFFFF',
        bg: '#F8F9FB',
        border: '#E4E8EF',
        muted: '#6B7799',
        light: '#9BA7C4',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s ease',
        'scale-in': 'scaleIn 0.2s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
