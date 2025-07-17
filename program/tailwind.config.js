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
        primary: "#4169E1",
        accent: {
          DEFAULT: "#32CD32",
          dark: "#228B22",
        },
        secondary: "#FF6347",
        // テキスト・背景色
        textColor: "#FFFFFF",
        bgColor: "#1E3A8A",
        cardBg: "#3B82F6",
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