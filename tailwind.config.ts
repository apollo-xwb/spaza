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
        snap: {
          glass: "rgba(255,255,255,0.72)",
          dock: "rgba(28,28,30,0.88)",
          lime: "#C8F135",
          yellow: "#FFFC00",
        },
        airly: {
          slate: "#5B6B8A",
          mist: "#E8EDF5",
          deep: "#3D4A63",
        },
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
        surface: { DEFAULT: "#E8EDF5", elevated: "#FFFFFF" },
        primary: "#000000",
        muted: "rgba(60,60,67,0.6)",
        accent: { DEFAULT: "#007AFF", teal: "#5AC8FA", orange: "#FF9500" },
        border: "rgba(60,60,67,0.12)",
      },
      borderRadius: {
        ios: "14px",
        "ios-lg": "20px",
        pill: "999px",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      screens: { md: "768px" },
    },
  },
  plugins: [],
};

export default config;
