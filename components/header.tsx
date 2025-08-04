"use client"

import { Badge } from "@/components/ui/badge"
import { MapPin, Users, AlertTriangle, Wifi, WifiOff, Loader2 } from "lucide-react"

interface HeaderProps {
  totalReports: number
  activeFilters: number
  connectionStatus: "connected" | "offline" | "connecting"
}

export default function Header({ totalReports, activeFilters, connectionStatus }: HeaderProps) {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-400" />
      case "offline":
        return <WifiOff className="w-4 h-4 text-red-400" />
      case "connecting":
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "En línea"
      case "offline":
        return "Sin conexión"
      case "connecting":
        return "Conectando..."
    }
  }

  return (
    <header className="bg-[#1a1a1a] border-b border-[#333] sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#00BFFF] p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mapa Colaborativo</h1>
              <p className="text-sm text-gray-400">Problemas Barriales</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#39FF14]" />
              <span className="text-sm text-gray-300">
                <span className="font-medium text-white">{totalReports}</span> reportes
              </span>
            </div>

            {activeFilters > 0 && (
              <Badge className="bg-[#39FF14] text-black">
                {activeFilters} filtro{activeFilters > 1 ? "s" : ""} activo{activeFilters > 1 ? "s" : ""}
              </Badge>
            )}

            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-xs text-gray-400">{getConnectionText()}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Comunidad activa</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
