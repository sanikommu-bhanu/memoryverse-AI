/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111111", soft: "#F5F5F7", edge: "#EAEAEA",
        muted: "#6B6B6F", faint: "#9A9A9E"
      },
      borderRadius: { card: "28px", pill: "999px" },
      boxShadow: { card: "0 8px 32px rgba(0,0,0,0.06)", float: "0 16px 48px rgba(0,0,0,0.1)" }
    }
  },
  plugins: []
};
