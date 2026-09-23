/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        admin: {
          blue: '#1E40AF',
          teal: '#0D9488',
          accent: '#0284C7',
          lightBg: '#F8FAFC',
          darkBg: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}
