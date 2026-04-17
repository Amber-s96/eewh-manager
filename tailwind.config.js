/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f2f7f2',
          100: '#e0ece0',
          200: '#c2d9c2',
          300: '#a8c5a8',
          400: '#8faf8f',
          500: '#5c7a5c',
          600: '#4a6a4a',
          700: '#3a5a3a',
          800: '#2c3a2c',
          900: '#1e281e',
        },
        bg: '#f5f7f5',
        warn: '#c4956a',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
