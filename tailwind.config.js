/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0084ff",
        success: "#31a24c",
        danger: "#e53238",
        warning: "#ffa500",
      },
    },
  },
  plugins: [],
};
