import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', "Tahoma", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf7",
          100: "#d1faec",
          200: "#a7f3da",
          300: "#6ee7c2",
          400: "#34d3a6",
          500: "#10b98e",
          600: "#059674",
          700: "#047860",
          800: "#065f4d",
          900: "#064e40",
        },
      },
      minHeight: { tap: "3rem" },
    },
  },
  plugins: [],
} satisfies Config;
