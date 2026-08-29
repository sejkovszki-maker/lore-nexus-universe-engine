/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#d4af37',
        'gold-dark': '#b8860b',
        'blood-red': '#8b0000',
        parchment: '#eaddc5',
        'dark-bg': '#0a0809',
        'dark-card': '#1a1819'
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
