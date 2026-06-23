import type { Config } from "tailwindcss";

/**
 * APP DEPORTE 2.0 — Design system "Night Pitch" (dark premium / energético).
 *
 * - `ink`  : lienzo y superficies casi-negras, ligeramente frías (azuladas).
 * - `lime` : primario verde-lima eléctrico (energía deportiva, alto rendimiento).
 *            Sobre `lime` se usa texto `ink-950` para máximo contraste.
 * - `brand`: alias de `lime` por compatibilidad con clases `brand-*` previas.
 * - Estados semánticos (emerald/amber/red/sky) usan la escala default de Tailwind.
 *
 * Tipografía: Sora (display/marca) + Inter (cuerpo), inyectadas como CSS vars en el layout.
 */
const lime = {
  50: "#f3ffd9",
  100: "#e6ffb0",
  200: "#d0ff73",
  300: "#b8f73f",
  400: "#9ee80f",
  500: "#84cc00",
  600: "#689f00",
  700: "#4f7a02",
  800: "#3f6008",
  900: "#34500c",
} as const;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#eef1f5",
          100: "#dde3ea",
          200: "#b9c3cf",
          300: "#8a97a6",
          400: "#5a6776",
          500: "#3c4854",
          600: "#2a343d",
          700: "#1f2830",
          750: "#182029",
          800: "#131a22",
          850: "#0e141b",
          900: "#0a0e13",
          950: "#06090c",
        },
        lime,
        brand: lime,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(158,232,15,0.25), 0 8px 30px -8px rgba(132,204,0,0.45)",
        "glow-sm": "0 0 18px -6px rgba(158,232,15,0.55)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -16px rgba(0,0,0,0.8)",
        pop: "0 24px 60px -20px rgba(0,0,0,0.85)",
      },
      backgroundImage: {
        "grid-ink":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "lime-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(132,204,0,0.18) 0%, rgba(132,204,0,0) 70%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.18s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
