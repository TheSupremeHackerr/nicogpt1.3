// src/app/layout.tsx
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NicoGPT - Asistente de IA",
  description: "Chatea con NicoGPT, tu asistente personal de IA potenciado por Hugging Face",
  // Aquí puedes añadir metadatos adicionales
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="google-site-verification" content="qUm7jO3_FqCGpQ3nfaFzRYGA-YdMDQqnOLoVPtVuyFQ" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
