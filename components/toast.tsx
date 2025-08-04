"use client"
import { X, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts
        .filter((toast) => toast.open !== false)
        .map((toast) => (
          <div
            key={toast.id}
            className={`
              max-w-sm p-4 rounded-lg shadow-lg border pointer-events-auto
              transform transition-all duration-300 ease-in-out
              ${
                toast.variant === "destructive"
                  ? "bg-red-900/90 border-red-700 text-red-100 backdrop-blur-sm"
                  : "bg-[#1a1a1a]/90 border-[#333] text-white backdrop-blur-sm"
              }
              animate-in slide-in-from-right-full
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                {toast.variant === "destructive" ? (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {toast.title && <h4 className="font-medium text-sm mb-1">{toast.title}</h4>}
                  {toast.description && <p className="text-xs opacity-90 leading-relaxed">{toast.description}</p>}
                </div>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10 flex-shrink-0"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
    </div>
  )
}
