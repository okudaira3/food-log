/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // メインカラー
        primary: "#F8F9FA",
        accent: "#b22832",
        secondary: "#85E0A3",
        // テキスト・背景色
        textColor: "#2C3E50",
        bgColor: "#FEFEFE",
        cardBg: "#F8F9FA",
      },
      // フォント設定追加
      fontFamily: {
        sans: ['"Helvetica Neue"', "Arial", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      // スペーシング設定追加
      spacing: {
        128: "32rem",
      },
    },
  },
  plugins: [],
}