import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', "Tahoma", "system-ui", "sans-serif"],
        display: ['"Cairo"', '"Oswald"', '"IBM Plex Sans Arabic"', "sans-serif"],
      },
      colors: {
        // brand-* يتبع لون الثيم المختار تلقائيًا
        brand: {
          50: "rgb(var(--accent) / 0.08)",
          100: "rgb(var(--accent) / 0.14)",
          200: "rgb(var(--accent) / 0.3)",
          300: "rgb(var(--accent) / 0.5)",
          400: "rgb(var(--accent-strong) / <alpha-value>)",
          500: "rgb(var(--accent) / <alpha-value>)",
          600: "rgb(var(--accent) / <alpha-value>)",
          700: "rgb(var(--accent-strong) / <alpha-value>)",
          800: "rgb(var(--accent-strong) / <alpha-value>)",
          900: "rgb(var(--accent-strong) / <alpha-value>)",
          950: "rgb(var(--accent) / 0.12)",
        },
      },
      minHeight: { tap: "3rem" },
    },
  },
  plugins: [],
} satisfies Config;
