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
        cBlack: "#272829",
        deepGray: "#61677A",
        gray: "#BDC3C7",
        lightGray: "#D8D9DA",
      }
    },
  },
  plugins: [],
}

