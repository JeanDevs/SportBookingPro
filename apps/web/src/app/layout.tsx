import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

/**
 * Tipografía del tema "Pitch Green": Inter para cuerpo (legible en tablas y
 * formularios) y Sora para títulos/marca (geométrica, con carácter deportivo).
 * Se exponen como CSS variables que consume Tailwind (fontFamily.sans/display).
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "APP DEPORTE",
  description: "Gestion de canchas, reservas, clientes y pagos."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
