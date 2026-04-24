/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#131316',
        surface: '#1b1b1e',
        fuchsia: {
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
        zinc: {
          400: '#a1a1aa',
          500: '#71717a',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      }
    },
  },
  plugins: [],
}