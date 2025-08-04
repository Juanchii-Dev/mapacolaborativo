"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast" // Corrected import path for useToast
import { WifiOff, Wifi } from "lucide-react"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "Conexión Restablecida",
        description: "Estás de nuevo en línea.",
        action: <Wifi className="h-5 w-5 text-green-500" />,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "Sin Conexión",
        description: "Parece que estás desconectado. Algunas funciones pueden no estar disponibles.",
        variant: "destructive",
        action: <WifiOff className="h-5 w-5 text-red-500" />,
        duration: 5000,
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  return null // This component primarily uses toasts for notifications
}
