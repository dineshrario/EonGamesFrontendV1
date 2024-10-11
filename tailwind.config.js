/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        BgBlue: '#638ADF', // Add your custom color here
        BgName: '#123379', // Add your custom color here
      },
    },
  },
  plugins: [],
}

