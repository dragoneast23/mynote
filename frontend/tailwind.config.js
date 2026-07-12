/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#37c2bc',
        primaryLight: '#d0e9e7',
        danger: '#ff6b6b',
        bg: '#f5f5f5'
      }
    },
  },
  plugins: [],
}
