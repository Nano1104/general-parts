/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.html',
      './src/**/*.js',
      './src/**/*.jsx',
      './src/**/*.ts',
      './src/**/*.tsx',
    ],
  },
  theme: {
    screens: {
      "mobile": "375px",  // Celular pequeño (iPhone SE, etc.)
      'sm': '640px',      // Celulares grandes / phablets
      'md': '768px',      // Tablets en vertical
      'lg': '1024px',     // Tablets en horizontal / notebooks pequeñas
      'xl': '1280px',     // Notebooks estándar
      '2xl': '1536px',    // Monitores medianos
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
        lightRed: "#D7263D",
        deepRed: "#66212a",
        cBlack: "#272829",
        deepGray: "#61677A",
        gray: "#A6A9AD",
        lightGray: "#D8D9DA",
        cWhite: "#ECF0F1",

        deepBlue: "#1C1C1C",
        coral: "#ffb3a5"
      },
      backgroundImage: {
        'homeBg': "url('/spare-parts2.jpg')",
        'authPageBg': "url('/bg-login.avif')",
        'custom-gradient': 'linear-gradient(0deg, rgba(255,255,255,1) 15%, rgba(34,193,195,0) 100%)',
      }
    },
  },
  plugins: [],
}

