/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0084ff",
        success: "#31a24c",
        danger: "#e53238",
        warning: "#ffa500",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".pb-safe": {
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        },
        ".pt-safe": {
          paddingTop: "max(0px, env(safe-area-inset-top))",
        },
        ".pl-safe": {
          paddingLeft: "max(0px, env(safe-area-inset-left))",
        },
        ".pr-safe": {
          paddingRight: "max(0px, env(safe-area-inset-right))",
        },
      });
    },
  ],
};
