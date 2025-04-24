/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixelify: ['Pixelify Sans Variable', 'sans-serif'],
        nippo : ["Nippo-Variable", "sans-serif"],
        silk : ["Silkscreen-Regular", "sans-serif"],
        silkbold : ["Silkscreen-Bold", "sans-serif"],
        vt: ["VT323-Regular", "sans-serif"],
        array: ["Array-Regular", "sans-serif"],
        arraysemi: ["Array-Semibold", "sans-serif"]
      },
      colors : {
        accent : "#E5D0AC",
        primary: "#FEF9E1",
        lightorange : "#FF9D23",
        orange : "#C14600",
        deepred : "#e81123",
        lightgray : "#83827d",
        darkgreen : "#065f46",
        lightgreen : "#047857"
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow')
  ],
}


