/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FDF8EE',
          100: '#F5E8D0',
          200: '#E8D5B5',
          300: '#D4BC95',
        },
        rose: {
          DEFAULT: '#C8706E',
          dark: '#9E4E4C',
          light: '#EFC5C4',
          pale: '#FAF0EF',
        },
        text: {
          base: '#2D1F14',
          mid: '#6B5040',
          muted: '#9B8070',
        },
        paper: '#FFFDF9',
        ink: '#1A1008',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 20px rgba(45, 31, 20, 0.06), 0 1px 4px rgba(45, 31, 20, 0.04)',
        'card-hover':
          '0 8px 32px rgba(45, 31, 20, 0.1), 0 2px 8px rgba(45, 31, 20, 0.06)',
        rose: '0 8px 20px rgba(200, 112, 110, 0.3)',
        wax: '0 2px 8px rgba(200, 112, 110, 0.4)',
      },
      letterSpacing: {
        'tight-display': '-0.02em',
      },
    },
  },
  plugins: [],
}
