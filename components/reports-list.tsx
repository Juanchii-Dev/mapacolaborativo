"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, User, ThumbsUp, Eye } from "lucide-react"
import type { Report } from "@/app/page"
import Image from "next/image"

interface ReportsListProps {
  reports: Report[]
  onReportClick: (report: Report) => void
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

export default function ReportsList({ reports, onReportClick }: ReportsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Hoy"
    if (diffDays === 2) return "Ayer"
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`

    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    })
  }

  if (reports.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">No hay reportes</p>
          <p className="text-sm">No se encontraron reportes con los filtros aplicados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden h-full">
      <div className="p-4 border-b border-[#333]">
        <h3 className="text-lg font-medium text-white">Reportes Recientes</h3>
        <p className="text-sm text-gray-400">
          {reports.length} problema{reports.length !== 1 ? "s" : ""} reportado{reports.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="bg-[#121212] border-[#333] hover:border-[#00BFFF] transition-colors cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Image or Icon */}
                <div className="flex-shrink-0">
                  {report.image_url ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={report.image_url || "/placeholder.svg"}
                        alt="Imagen del problema"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-lg ${problemTypeColors[report.type as keyof typeof problemTypeColors]} flex items-center justify-center`}
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      className={`${problemTypeColors[report.type as keyof typeof problemTypeColors]} text-white text-xs`}
                    >
                      {problemTypeLabels[report.type as keyof typeof problemTypeLabels]}
                    </Badge>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(report.created_at)}</span>
                  </div>

                  <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">{report.description}</h4>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{report.address}</span>
                  </div>

                  {report.reporter_name && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <User className="w-3 h-3" />
                      <span>Por {report.reporter_name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <ThumbsUp className="w-3 h-3" />
                      <span>
                        {report.votes} vecino{report.votes !== 1 ? "s" : ""} afectado{report.votes !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <Button
                      onClick={() => onReportClick(report)}
                      size="sm"
                      className="bg-[#00BFFF] hover:bg-[#0099CC] text-white h-7 px-3 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
