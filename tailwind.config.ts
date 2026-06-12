import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en estadio nocturno: cesped, luces y confeti
        pitch: {
          50: "#effaf2",
          100: "#d7f2de",
          400: "#34d177",
          500: "#16a34a",
          600: "#108040",
          900: "#0a3d22",
        },
        night: {
          800: "#11162a",
          900: "#0b0f1f",
          950: "#070a16",
        },
        gold: {
          300: "#ffe08a",
          400: "#ffd24d",
          500: "#f5b50a",
        },
        flare: {
          400: "#ff7a59",
          500: "#ff4d6d",
          600: "#e11d48",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,210,77,0.25), 0 8px 30px rgba(245,181,10,0.18)",
        card: "0 10px 30px -12px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "stadium-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "score-pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "score-pop": "score-pop 0.45s cubic-bezier(.2,.8,.2,1)",
        "fade-up": "fade-up 0.5s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
