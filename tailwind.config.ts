import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wellness: {
          bg: "#F6F5F1",
          surface: "#FFFFFF",
          "surface-alt": "#FBFBF9",
          border: "#E4E8E5",
          "border-subtle": "#ECEFEF",
          primary: "#17252B",
          secondary: "#657278",
          muted: "#8C989E",
          accent: "#2F6B62",
          "accent-hover": "#25574F",
          "accent-soft": "#E7F0EC",
          "accent-soft-hover": "#DBE8E2",
          warning: "#A96B2C",
          "warning-soft": "#FAF3EB",
          danger: "#B84C4C",
          "danger-soft": "#FBECEC",
          success: "#2B7A58",
          "success-soft": "#E8F4EF",
        },
      },
      borderRadius: {
        card: "18px",
        control: "11px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(23, 37, 43, 0.04), 0 1px 2px -1px rgba(23, 37, 43, 0.04)",
        card: "0 2px 8px -2px rgba(23, 37, 43, 0.05), 0 1px 4px -1px rgba(23, 37, 43, 0.03)",
        elevated: "0 10px 25px -5px rgba(23, 37, 43, 0.08), 0 8px 10px -6px rgba(23, 37, 43, 0.03)",
      },
    },
  },
  plugins: [],
};
export default config;
