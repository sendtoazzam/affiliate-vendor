import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#4B146E",
          "primary-content": "#ffffff",
          "secondary": "#D4AF37",
          "secondary-content": "#2B0045",
          "accent": "#7C2DA8",
          "accent-content": "#ffffff",
          "neutral": "#2B0045",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#e4e7ec",
          "base-content": "#1a0f2e",
          "info": "#0ba5ec",
          "info-content": "#ffffff",
          "success": "#12b76a",
          "success-content": "#ffffff",
          "warning": "#f79009",
          "warning-content": "#1a0f2e",
          "error": "#f04438",
          "error-content": "#ffffff",
          "--rounded-box": "0.375rem",
          "--rounded-btn": "0.375rem",
          "--rounded-badge": "0.375rem",
        },
      },
      "light",
    ],
    default: "light",
    darkTheme: "light",
    base: true,
    styled: true,
    utils: true,
  },
};
export default config;
