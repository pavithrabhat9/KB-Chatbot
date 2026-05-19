/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e8f3',
          100: '#e8d1e8',
          200: '#d1a3d1',
          300: '#ba75ba',
          400: '#a347a3',
          500: '#982598',  // Main primary
          600: '#7a1e7a',
          700: '#5c165c',
          800: '#3d0f3d',
          900: '#1f071f',
        },
        dark: {
          50: '#F1E9E9',
          100: '#e0d5d5',
          200: '#c2abab',
          300: '#a38282',
          400: '#855858',
          500: '#672f2f',
          600: '#4a1515',
          700: '#2d0d0d',
          800: '#15173D',  // Main dark navy
          900: '#0e0f29',
        },
        accent: {
          light: '#E491C9',
          DEFAULT: '#E491C9',
        }
      },
    },
  },
  plugins: [],
}