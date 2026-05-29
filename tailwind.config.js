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
        },
        text: {
          base: '#2D1F14',
          mid: '#6B5040',
          muted: '#9B8070',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
        serif: ['Gowun Batang', 'serif'],
      },
    },
  },
  plugins: [],
}
