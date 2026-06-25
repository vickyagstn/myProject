/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f4',
          100: '#fce7ea',
          700: '#a9213a',
          800: '#800020',
          900: '#6b1a1e',
          950: '#3b0a0e',
        },
      },
    },
  },
  plugins: [],
}