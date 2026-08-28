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
        ios: {
          bg: "#F2F2F7",
          card: "#FFFFFF",
          blue: "#007AFF",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
          purple: "#AF52DE",
          teal: "#5AC8FA",
          label: "#000000",
          secondary: "rgba(60,60,67,0.6)",
          tertiary: "rgba(60,60,67,0.3)",
          fill: "rgba(120,120,128,0.12)",
          separator: "rgba(60,60,67,0.12)",
        },
        surface: { DEFAULT: "#F2F2F7", elevated: "#FFFFFF" },
        primary: "#000000",
        muted: "rgba(60,60,67,0.6)",
        accent: { DEFAULT: "#007AFF", teal: "#5AC8FA", orange: "#FF9500" },
        border: "rgba(60,60,67,0.12)",
      },
      borderRadius: {
        ios: "14px",
        "ios-lg": "20px",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      screens: { md: "768px" },
    },
  },
  plugins: [],
};

export default config;
