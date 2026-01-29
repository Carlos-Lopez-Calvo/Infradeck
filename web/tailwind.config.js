/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'game-blue': '#1e40af',
          'game-red': '#dc2626',
          'game-gold': '#f59e0b',
          'game-dark': '#0f172a',
        },
        animation: {
          'glow': 'glow 2s ease-in-out infinite alternate',
          'shake': 'shake 0.5s ease-in-out',
          'pulse-heal': 'pulse-heal 1s ease-in-out',
        }
      },
    },
    plugins: [],
  }