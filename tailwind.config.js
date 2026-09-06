/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050b18',
          900: '#0b1f3f',
          800: '#0f2a57',
          700: '#153a75',
          600: '#1d4ed8',
          500: '#2f63eb',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
    },
  },
  plugins: [],
}
