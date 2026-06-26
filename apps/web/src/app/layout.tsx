import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

/**
 * Tipografía 2.0: Inter (cuerpo, legible en tablas/formularios) + Sora
 * (display/marca, geométrica con carácter deportivo). Se exponen como CSS
 * variables que consumen Tailwind (`font-sans` / `font-display`) y `globals.css`.
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

export const metadata: Metadata = {
  title: {
    default: "SportBook Pro — Reserva tu cancha",
    template: "%s · SportBook Pro",
  },
  description:
    "Reserva canchas deportivas en segundos y gestiona tu complejo: reservas, pagos y clientes en un solo lugar.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-ink-950 text-ink-100 antialiased">{children}</body>
    </html>
  );
}
