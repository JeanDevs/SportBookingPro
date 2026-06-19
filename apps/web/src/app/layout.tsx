import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "APP DEPORTE",
  description: "Gestion de canchas, reservas, clientes y pagos."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
