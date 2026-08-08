/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/lib/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0d1117',
          900: '#131921',
          800: '#232f3e',
          700: '#2f3e50',
        },
        brand: {
          pink: {
            50: '#fce4ec',
            100: '#fde3ef',
            200: '#f1e1e6',
            300: '#d1a3c7',
            400: '#f472b6',
            500: '#ec4899',
          },
          purple: {
            50: '#f3e8ff',
            100: '#e8d5f0',
            200: '#d1c4e9',
            300: '#c084d0',
            400: '#a78bfa',
            500: '#9b59b6',
            600: '#7c3aed',
            700: '#7a6fb0',
            900: '#4c1d95',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #f1e1e6 0%, #d1a3c7 50%, #7a6fb0 100%)',
        'brand-gradient': 'linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
        'carousel-1': 'linear-gradient(120deg, #e8d5f0 0%, #c084d0 60%, #7c3aed 100%)',
        'carousel-2': 'linear-gradient(120deg, #fce4ec 0%, #d1a3c7 60%, #9b59b6 100%)',
        'carousel-3': 'linear-gradient(120deg, #d1c4e9 0%, #a78bfa 60%, #4c1d95 100%)',
      },
      boxShadow: {
        card: '0 8px 32px rgba(122, 111, 176, 0.22)',
        'card-hover': '0 12px 40px rgba(122, 111, 176, 0.3)',
        cat: '0 6px 24px rgba(122, 111, 176, 0.25)',
        glass: '0 8px 32px rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        glass: '14px',
      },
      keyframes: {
        'badge-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'badge-pulse': 'badge-pulse 2s infinite',
        'fade-in': 'fade-in 0.5s ease forwards',
      },
      borderRadius: {
        xl: '0.85rem',
        '2xl': '1.15rem',
      },
      zIndex: {
        60: '60',
        100: '100',
      },
    },
  },
  plugins: [],
};