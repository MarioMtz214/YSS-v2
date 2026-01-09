/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        YSS1: "var(--YSS1)",
        YSS2: "var(--YSS2)",
      }},
  },
  plugins: [],
}