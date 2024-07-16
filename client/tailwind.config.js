/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        custom: ["GT America Condensed", "Helvetica", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        poppins: ["Poppins", "sans-serif"]
      },
      colors: {
        orange: "#DC5F00",
        red: "#66212a",
        cBlack: "#373A40",
        deepGray: "#61677A",
        gray: "#D8D9DA",
        lightGray: "#BDC3C7",
      }
    },
  },
  plugins: [],
}

