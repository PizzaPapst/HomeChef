/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
        // Wir setzen Poppins an die erste Stelle bei 'sans'. 
        // Tailwind nutzt das dann automatisch für alles.
        sans: ['Poppins', 'sans-serif'],
        },
        colors: {
        // Name: 'Hex-Code'
        'custom-bg': '#FCFDFD',      // Dein Hintergrundgrau aus Figma?
        'brand-teal': '#28AFB0',     // Dein spezielles Türkis
        'brand-orange': '#FF785A',
        'teal-light': '#D5F5F5',
        'text-default': '#201E1F',
        'text-subinfo': '#847B7F',
        'border-default': '#DCDFDD'   // Dein spezielles Orange
      }
    },
  },
  plugins: [],
}