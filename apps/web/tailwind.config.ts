import type { Config } from "tailwindcss";

/**
 * Tema "Pitch Green" — identidad deportiva profesional para APP DEPORTE.
 * El verde evoca el césped/cancha y unifica toda la app con la pantalla de auth
 * (que ya era verde). `brand` es el color de marca; los neutros usan la escala
 * `slate`/`gray` de Tailwind. Tonos de estado (verde/ámbar/rojo) siguen siendo
 * semánticos y se dejan tal cual.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecf6f0",
          100: "#d2e9dd",
          200: "#a8d4bd",
          300: "#75b896",
          400: "#45976f",
          500: "#2b7d57",
          600: "#1f6344",
          700: "#1a4e37",
          800: "#163f2d",
          900: "#102f22",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
