/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#070B14',
          900: '#0B1120',
          800: '#111A2E',
          700: '#182541',
          600: '#22315286',
        },
        emerald: {
          DEFAULT: '#0E9F6E',
          soft: '#12B886',
          deep: '#065F46',
        },
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E8CB6E',
        },
        ink: {
          100: '#EDF1F7',
          300: '#B8C2D6',
          500: '#7C88A3',
        },
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'serif'],
        bengali: ['var(--font-bengali)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      backgroundImage: {
        'star-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.06'%3E%3Cpath d='M60 10 L74 46 L110 46 L81 68 L92 104 L60 82 L28 104 L39 68 L10 46 L46 46 Z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
