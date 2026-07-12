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
          950: '#050e09',
          900: '#0a1a0f',
          800: '#0f2a1e',
          700: '#15382a',
          600: '#1f4a3686',
        },
        emerald: {
          DEFAULT: '#2bd9ac',
          soft: '#4de8a0',
          deep: '#0e7a8f',
        },
        gold: {
          DEFAULT: '#f5b942',
          soft: '#fbbf24',
        },
        ink: {
          100: '#eafff2',
          300: '#a4d9bf',
          500: '#72a893',
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
        'forest-gradient': 'linear-gradient(160deg, #060f0b 0%, #0a2118 42%, #0e3524 100%)',
      },
    },
  },
  plugins: [],
};

