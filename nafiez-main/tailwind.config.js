/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f2f5f7',
          100: '#dbe3e8',
          200: '#b7c6d0',
          300: '#8ea4b4',
          400: '#617d91',
          500: '#3f6078',
          600: '#294963',
          700: '#173752',
          800: '#082b4b',
          900: '#061f38',
          950: '#031321',
        },
        gold: {
          50: '#fff9ed',
          100: '#f9e9bd',
          200: '#f0d38a',
          300: '#e4b957',
          400: '#d29b2e',
          500: '#b77d18',
          600: '#925f12',
          700: '#6e450d',
          800: '#4a2e09',
          900: '#2e1c06',
        },
        brand: {
          blue: '#0b6b87',
          'blue-dark': '#07546d',
          'blue-light': '#62a8b9',
          bg: '#f5f7f6',
          ink: '#182b38',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        arabic: ['"Noto Sans Arabic"', 'Tahoma', 'Arial', 'sans-serif'],
        chinese: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(8, 43, 75, 0.12)',
        card: '0 8px 32px -12px rgba(8, 43, 75, 0.18)',
        gold: '0 8px 32px -12px rgba(210, 155, 46, 0.32)',
        navy: '0 20px 60px -20px rgba(8, 43, 75, 0.42)',
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
        'navy-gradient': 'linear-gradient(135deg, #082b4b 0%, #173752 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d29b2e 0%, #e4b957 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(6,31,56,0.82) 0%, rgba(8,43,75,0.54) 50%, rgba(3,19,33,0.88) 100%)',
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
