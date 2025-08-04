"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  status: "connected" | "offline" | "connecting"
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (status === "offline" || status === "connecting") {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 3000) // Hide after 3 seconds if connected
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-b-lg shadow-lg flex items-center gap-2 text-sm transition-all duration-300",
        status === "connected" && "bg-green-500 text-white",
        status === "offline" && "bg-red-500 text-white",
        status === "connecting" && "bg-yellow-500 text-black",
      )}
    >
      {status === "connected" && <Wifi className="w-4 h-4" />}
      {status === "offline" && <WifiOff className="w-4 h-4" />}
      {status === "connecting" && <span className="animate-pulse">...</span>}
      <span>
        {status === "connected" && "Conectado"}
        {status === "offline" && "Modo Offline"}
        {status === "connecting" && "Conectando..."}
      </span>
    </div>
  )
}
