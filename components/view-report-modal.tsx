"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Calendar, MapPin, User, Loader2 } from "lucide-react"
import type { Report } from "@/app/page"
import Image from "next/image"

interface ViewReportModalProps {
  report: Report | null
  onClose: () => void
  onVote: (reportId: string) => Promise<void>
}

const problemTypeLabels = {
  bache: "Bache en la calle",
  luz: "Luminaria rota",
  basura: "Basura acumulada",
  inseguridad: "Problema de inseguridad",
  otro: "Otro problema",
}

const problemTypeColors = {
  bache: "bg-red-500",
  luz: "bg-yellow-500",
  basura: "bg-green-500",
  inseguridad: "bg-purple-500",
  otro: "bg-[#00BFFF]",
}

export default function ViewReportModal({ report, onClose, onVote }: ViewReportModalProps) {
  const [isVoting, setIsVoting] = useState(false)

  if (!report) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleVote = async () => {
    if (isVoting) return

    setIsVoting(true)
    try {
      await onVote(report.id)
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-[#333] text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#00BFFF] flex items-center gap-2">
            <Badge className={`${problemTypeColors[report.type as keyof typeof problemTypeColors]} text-white`}>
              {problemTypeLabels[report.type as keyof typeof problemTypeLabels]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagen si existe */}
          {report.image_url && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#1a1a1a]">
              <Image
                src={report.image_url || "/placeholder.svg"}
                alt="Imagen del problema"
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
            </div>
          )}

          {/* Información del reporte */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(report.created_at)}</span>
            </div>

            <div className="flex items-start gap-2 text-gray-300">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{report.address}</span>
            </div>

            {report.reporter_name && (
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" />
                <span className="text-sm">Reportado por: {report.reporter_name}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <h4 className="font-medium text-white mb-2">Descripción:</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{report.description}</p>
          </div>

          {/* Botón de voto */}
          <div className="flex items-center justify-between pt-4 border-t border-[#333]">
            <div className="flex items-center gap-2 text-gray-300">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">
                <span className="font-medium text-white">{report.votes}</span> vecino{report.votes !== 1 ? "s" : ""}{" "}
                afectado{report.votes !== 1 ? "s" : ""}
              </span>
            </div>

            <Button
              onClick={handleVote}
              disabled={isVoting}
              className="bg-[#39FF14] hover:bg-[#2ECC11] text-black disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              {isVoting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Votando...
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Este problema también me afecta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
