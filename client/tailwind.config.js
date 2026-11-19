/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Dark mode follows the "dark" class on <html> (set by src/utils/theme.js), so dark: variants also work.
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
}