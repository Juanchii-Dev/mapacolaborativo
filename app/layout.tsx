import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/toast"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mapa Colaborativo de Problemas Barriales",
  description: "Reporta y visualiza problemas urbanos en tu barrio de forma colaborativa",
  keywords: ["problemas urbanos", "barrio", "comunidad", "reportes", "mapa colaborativo"],
  authors: [{ name: "Mapa Colaborativo Team" }],
  openGraph: {
    title: "Mapa Colaborativo de Problemas Barriales",
    description: "Reporta y visualiza problemas urbanos en tu barrio de forma colaborativa",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  )
}
