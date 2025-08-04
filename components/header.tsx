"use client"

import Link from "next/link"
import { MapPin, List, PlusCircle, Settings } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/components/supabase-auth-provider"
import Image from "next/image"

export function Header() {
  const { user, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/placeholder-logo.png" alt="Logo" width={24} height={24} />
            <span className="hidden md:inline">Mapa de Problemas</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="flex items-center gap-1 text-sm font-medium hover:underline">
              <MapPin className="h-4 w-4" />
              Mapa
            </Link>
            <Link href="/reports" className="flex items-center gap-1 text-sm font-medium hover:underline">
              <List className="h-4 w-4" />
              Reportes
            </Link>
            <Link href="/new-report" className="flex items-center gap-1 text-sm font-medium hover:underline">
              <PlusCircle className="h-4 w-4" />
              Nuevo Reporte
            </Link>
            {user && (
              <Link href="/admin" className="flex items-center gap-1 text-sm font-medium hover:underline">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
