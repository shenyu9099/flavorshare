/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flavor-orange': '#F26B1D',
        'flavor-red': '#E63946',
        'flavor-coral': '#FF6B6B',
        'flavor-dark': '#1A1A2E',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

