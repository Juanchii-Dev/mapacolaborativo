"use client"

import { Button } from "@/components/ui/button"
import { User2, LogOut } from "lucide-react"
import { useAuth } from "@/components/supabase-auth-provider"
import { ConnectionStatus } from "./connection-status"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  totalReports: number
  activeFilters: number
  connectionStatus: "connected" | "offline" | "connecting"
}

export default function Header({ totalReports, activeFilters, connectionStatus }: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-[#333] text-white relative z-10">
      <ConnectionStatus status={connectionStatus} />
      <h1 className="text-2xl font-bold text-[#00BFFF]">Mapa de Problemas</h1>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-300 hidden sm:block">
          {totalReports} Reportes {activeFilters > 0 && `(${activeFilters} filtros activos)`}
        </div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User2 className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.user_metadata?.full_name || "Usuario"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white bg-transparent"
          >
            Iniciar Sesión
          </Button>
        )}
      </div>
    </header>
  )
}
