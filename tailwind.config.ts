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
        hud: {
          bg: "#0A0E14",
          panel: "#121212",
          cyan: "#00E5FF",
          amber: "#E8B84A",
          glass: "rgba(255,255,255,0.06)",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        pulseRing: "pulseRing 2s ease-out infinite",
        routeFlow: "routeFlow 2s linear infinite",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.5)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        routeFlow: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-40" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
