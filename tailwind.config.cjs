/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B9080",
        accent: "#C97C5D",
      },
    },
  },
  plugins: [],
}
