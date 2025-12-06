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
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'typing': 'typing 1.4s infinite',
        'progressBar': 'progressBar 5s linear',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'fadeInUp': 'fadeInUp 0.8s ease-out',
        'slideInUp': 'slideInUp 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(102, 126, 234, 0.8)' },
        },
        'typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.7' },
          '30%': { transform: 'translateY(-10px)', opacity: '1' },
        },
        'progressBar': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideInUp': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideInRight': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
