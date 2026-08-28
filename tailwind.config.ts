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
      screens: {
        md: "768px",
      },
    },
  },
  plugins: [],
};

export default config;
