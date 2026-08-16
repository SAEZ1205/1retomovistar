import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/src/index.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Movistar | Entiende tu recibo",
  description: "Módulo académico de LucIA para explicar recibos y consumo móvil con datos verificados.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
