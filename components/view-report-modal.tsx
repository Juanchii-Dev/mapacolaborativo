"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ThumbsUp, CalendarDays, User2 } from "lucide-react"
import type { Report } from "@/app/page"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ViewReportModalProps {
  isOpen: boolean
  onClose: () => void
  report: Report | null
  onVote: (reportId: string) => void
}

export default function ViewReportModal({ isOpen, onClose, report, onVote }: ViewReportModalProps) {
  if (!report) return null

  const handleVoteClick = () => {
    onVote(report.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a1a] text-white border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-[#00BFFF] text-2xl">{report.type}</DialogTitle>
          <p className="text-gray-300 text-sm">{report.address}</p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {report.image_url && (
            <div className="relative w-full h-64 rounded-md overflow-hidden">
              <Image
                src={report.image_url || "/placeholder.svg"}
                alt={report.description || "Imagen del reporte"}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          )}
          <p className="text-gray-200 text-base">{report.description}</p>
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>{format(new Date(report.created_at), "dd MMMM yyyy HH:mm", { locale: es })}</span>
          </div>
          {report.reporter_name && (
            <div className="flex items-center text-sm text-gray-400">
              <User2 className="w-4 h-4 mr-2" />
              <span>Reportado por: {report.reporter_name}</span>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            onClick={handleVoteClick}
            className="bg-[#39FF14] hover:bg-[#2ECC11] text-black flex items-center gap-2 w-full sm:w-auto"
          >
            <ThumbsUp className="w-4 h-4" /> {report.votes} Votos
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white w-full sm:w-auto bg-transparent"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
