/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'theme-light': {
          bg: '#ffffff',
          text: '#1a1a1a',
          secondary: '#666666',
          accent: '#3b82f6',
        },
        'theme-sepia': {
          bg: '#f4ecd8',
          text: '#5c4b37',
          secondary: '#8b7355',
          accent: '#a67c52',
        },
        'theme-dark': {
          bg: '#1a1a2e',
          text: '#e0e0e0',
          secondary: '#a0a0a0',
          accent: '#60a5fa',
        },
      },
    },
  },
  plugins: [],
};
