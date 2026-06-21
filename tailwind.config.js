/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0A',
          surface: '#111118',
          card: '#14141F',
          hover: '#1C1C2E',
          border: '#2A2A3E',
        },
        neon: {
          cyan: '#00F0FF',
          magenta: '#FF007F',
          yellow: '#FFE600',
          lime: '#39FF14',
        },
        primary: {
          DEFAULT: '#FF007F',
          light: '#FF4DA6',
          dark: '#CC0066',
        },
        secondary: {
          DEFAULT: '#00F0FF',
          light: '#66F5FF',
          dark: '#00BCD4',
        },
        accent: {
          yellow: '#FFE600',
          lime: '#39FF14',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'sticky-drop': 'stickyDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'neon-flicker': 'neonFlicker 2s ease-in-out infinite',
        'pulse-ripple': 'pulseRipple 1.5s ease-out',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        stickyDrop: {
          '0%': { transform: 'translateY(-40px) scale(0.9)', opacity: '0' },
          '50%': { transform: 'translateY(8px) scale(1.02)', opacity: '1' },
          '70%': { transform: 'translateY(-3px) scale(0.99)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '5%': { opacity: '0.8' },
          '10%': { opacity: '1' },
          '15%': { opacity: '0.6' },
          '20%': { opacity: '1' },
          '50%': { opacity: '1' },
          '55%': { opacity: '0.9' },
          '60%': { opacity: '1' },
        },
        pulseRipple: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.3)' },
          '33%': { borderColor: 'rgba(255, 0, 127, 0.3)' },
          '66%': { borderColor: 'rgba(57, 255, 20, 0.3)' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
