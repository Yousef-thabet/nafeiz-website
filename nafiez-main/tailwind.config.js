/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3f9',
          100: '#d6e0f0',
          200: '#aebfe0',
          300: '#7e96c9',
          400: '#4f6db0',
          500: '#2f4d93',
          600: '#1f3a73',
          700: '#15295a',
          800: '#0d2144',
          900: '#08152e',
          950: '#040b1c',
        },
        gold: {
          50: '#fbf6ec',
          100: '#f5e8c8',
          200: '#ecd28f',
          300: '#e0bb5d',
          400: '#d2a343',
          500: '#b8852a',
          600: '#946620',
          700: '#704d1c',
          800: '#4d3415',
          900: '#2e1f0d',
        },
        brand: {
          blue: '#2596be',
          'blue-dark': '#1c7a9e',
          'blue-light': '#5fb6d4',
          bg: '#eef3f9',
          ink: '#1a2332',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        arabic: ['"Noto Sans Arabic"', 'Tahoma', 'Arial', 'sans-serif'],
        chinese: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(13, 33, 68, 0.12)',
        card: '0 8px 32px -12px rgba(13, 33, 68, 0.18)',
        gold: '0 8px 32px -12px rgba(210, 163, 67, 0.35)',
        navy: '0 20px 60px -20px rgba(13, 33, 68, 0.45)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      maxWidth: {
        container: '1280px',
        'container-narrow': '1080px',
      },
      transitionDuration: {
        250: '250ms',
        450: '450ms',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #0d2144 0%, #15295a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d2a343 0%, #e0bb5d 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(13,33,68,0.85) 0%, rgba(13,33,68,0.6) 50%, rgba(13,33,68,0.9) 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'route-dash': {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'route-dash': 'route-dash 3s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
