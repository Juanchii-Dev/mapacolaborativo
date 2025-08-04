"use client"

import type { Report } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"

interface ReportsListProps {
  reports: Report[]
  onReportClick: (report: Report) => void
  onVote: (reportId: string) => void
}

export default function ReportsList({ reports, onReportClick, onVote }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">No hay reportes que coincidan con los filtros aplicados.</div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {reports.map((report) => (
        <Card key={report.id} className="bg-[#1a1a1a] text-white border-[#333] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#00BFFF]">{report.type}</CardTitle>
            <p className="text-sm text-gray-300">{report.address}</p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            {report.image_url && (
              <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
                <Image
                  src={report.image_url || "/placeholder.svg"}
                  alt={report.description || "Imagen del reporte"}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
            <p className="text-sm text-gray-200 mb-3 line-clamp-3 flex-grow">{report.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span>
                Reportado hace {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es })}
              </span>
              {report.reporter_name && <span className="ml-auto">Por: {report.reporter_name}</span>}
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#333]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(report.id)}
                className="text-gray-300 hover:text-[#00BFFF] hover:bg-[#2a2a2a] flex items-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" /> {report.votes} Votos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReportClick(report)}
                className="text-gray-300 hover:text-[#39FF14] hover:bg-[#2a2a2a] flex items-center gap-1"
              >
                <MapPin className="w-4 h-4" /> Ver Detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
