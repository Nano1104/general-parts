/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      "mobile": "375px",
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
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
      },
      backgroundImage: {
        'homeBg': "url('bg-home.avif')",
        'custom-gradient': 'linear-gradient(0deg, rgba(255,255,255,1) 15%, rgba(34,193,195,0) 100%)',
      }
    },
  },
  plugins: [],
}

