import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseAuthProvider } from "@/components/supabase-auth-provider"
import { Header } from "@/components/header"
import { ConnectionStatus } from "@/components/connection-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mapa Colaborativo de Problemas",
  description: "Reporta y visualiza problemas en tu comunidad.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseAuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <ConnectionStatus />
            </div>
          </SupabaseAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
