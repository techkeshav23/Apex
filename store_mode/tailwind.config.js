/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#667eea',
        'secondary': '#764ba2',
        'accent-cyan': '#4fd1c5',
        'dark-bg': '#0a0e27',
        'dark-surface': '#1a1f3a',
        'dark-card': '#1a313a',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'typing': 'typing 1.4s infinite',
      }
    },
  },
  plugins: [],
}
