/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#101827",
        cloud: "#f6f8fb",
        cyanx: "#18b7a8",
        bluex: "#2563eb"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};
