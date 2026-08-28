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
        surface: {
          DEFAULT: "#F8F7F4",
          elevated: "rgba(255,255,255,0.72)",
        },
        primary: "#18181B",
        muted: "rgba(24,24,27,0.55)",
        accent: {
          DEFAULT: "#E78A3E",
          teal: "#0D9488",
        },
        border: "rgba(0,0,0,0.08)",
        hud: {
          bg: "#F8F7F4",
          panel: "#FFFFFF",
          cyan: "#0D9488",
          amber: "#E78A3E",
          glass: "rgba(255,255,255,0.65)",
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
