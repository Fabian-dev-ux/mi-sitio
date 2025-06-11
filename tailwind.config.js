/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Agregado para mejor compatibilidad
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: "#1C1C1C",
          800: "#2D3036",
          700: "#565A63",
          600: "#808591",
          500: "#A0A5B1",
          400: "#B6BCC7",
          300: "#CACFDB",
          200: "#D9DEE5",
          100: "#ECEFF4",
        },
        emerald: {
          400: "#34d399",
        },
        primary: "#FF5741", // Color principal
        dark: "#000000",
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"], 
        poppins: ["Poppins", "sans-serif"], 
        archivo:["Archivo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

