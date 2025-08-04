"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User, MessageCircle, ThumbsUp, Loader2 } from "lucide-react"
import Image from "next/image"
import { supabaseHelpers } from "@/lib/supabase"
import { useAuth } from "@/components/supabase-auth-provider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast" // Corrected import path for useToast
import dynamic from "next/dynamic"

// Dynamically import MapContainer and TileLayer from react-leaflet
const DynamicMapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
})
const DynamicTileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
})
const DynamicMarker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
  ssr: false,
})
const DynamicPopup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
})

interface Report {
  id: string
  type: string
  address: string
  description: string | null
  image_url: string | null
  latitude: number
  longitude: number
  created_at: string
  status: "pending" | "in_progress" | "resolved"
  votes: number
  reporter_name: string | null
  user_id: string | null
}

interface ViewReportModalProps {
  reportId: string | null
  isOpen: boolean
  onClose: () => void
  onReportUpdated: () => void
}

export function ViewReportModal({ reportId, isOpen, onClose, onReportUpdated }: ViewReportModalProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const fetchReportAndComments = async () => {
    if (!reportId) return
    setIsLoading(true)
    try {
      const { data: fetchedReport, error: reportError } = await supabaseHelpers.getReportById(reportId)
      if (reportError) throw reportError
      setReport(fetchedReport)

      const { data: fetchedComments, error: commentsError } = await supabaseHelpers.getReportComments(reportId)
      if (commentsError) throw commentsError
      setComments(fetchedComments || [])

      if (user) {
        const voted = await supabaseHelpers.hasUserVoted(user.id, reportId)
        setHasVoted(voted)
      }
    } catch (error: any) {
      console.error("Error fetching report or comments:", error.message)
      toast({
        title: "Error",
        description: `No se pudo cargar el reporte: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportAndComments()
    } else if (!isOpen) {
      // Reset form when modal closes
      setReport(null)
      setComments([])
      setNewComment("")
      setHasVoted(false)
    }
  }, [isOpen, reportId, user])

  const handleAddComment = async () => {
    if (!reportId || !newComment.trim()) return
    setIsSubmittingComment(true)
    try {
      const commenterName = user?.user_metadata?.full_name || user?.email || "Anónimo"
      const { data, error } = await supabaseHelpers.addComment(reportId, newComment, commenterName)
      if (error) throw error
      setComments((prev) => [...prev, data[0]])
      setNewComment("")
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido publicado.",
      })
    } catch (error: any) {
      console.error("Error adding comment:", error.message)
      toast({
        title: "Error",
        description: `No se pudo añadir el comentario: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleVote = async () => {
    if (!reportId || !user || isVoting) return
    setIsVoting(true)
    try {
      const { data, error } = await supabaseHelpers.addVoteToReport(reportId, user.id)
      if (error) {
        if (error.message.includes("duplicate key value violates unique constraint")) {
          toast({
            title: "Ya votaste",
            description: "Ya has votado por este reporte.",
            variant: "warning",
          })
        } else {
          throw error
        }
      } else {
        setHasVoted(true)
        setReport((prev) => (prev ? { ...prev, votes: prev.votes + 1 } : null))
        onReportUpdated() // Notify parent to refresh reports list
        toast({
          title: "Voto registrado",
          description: "Tu voto ha sido añadido.",
        })
      }
    } catch (error: any) {
      console.error("Error adding vote:", error.message)
      toast({
        title: "Error al votar",
        description: `No se pudo registrar tu voto: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default"
      case "in_progress":
        return "secondary"
      case "resolved":
        return "success" // Assuming a 'success' variant exists or can be styled
      default:
        return "default"
    }
  }

  if (!report) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cargando Reporte...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{report.type}</DialogTitle>
          <DialogDescription>Detalles del reporte</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {report.image_url && (
            <div className="relative h-60 w-full overflow-hidden rounded-md">
              <Image
                src={report.image_url || "/placeholder.png"}
                alt={`Imagen de ${report.type}`}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{report.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span>Reportado por: {report.reporter_name || "Anónimo"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
          </div>
          <p className="text-base">{report.description}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleVote}
              disabled={isVoting || authLoading || !user || hasVoted}
              className="flex items-center gap-2 bg-transparent"
            >
              {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
              Votar ({report.votes})
            </Button>
            {!user && <span className="text-sm text-gray-500 dark:text-gray-400">Inicia sesión para votar.</span>}
            {user && hasVoted && <span className="text-sm text-green-600 dark:text-green-400">¡Ya votaste!</span>}
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 text-lg font-semibold">Comentarios ({comments.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay comentarios aún.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-md bg-gray-100 p-3 text-sm dark:bg-gray-800">
                    <p className="font-medium">{comment.commenter_name || "Anónimo"}</p>
                    <p>{comment.comment}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Textarea
                placeholder="Añade un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
                disabled={!user || isSubmittingComment}
              />
              <Button onClick={handleAddComment} disabled={!user || isSubmittingComment || !newComment.trim()}>
                {isSubmittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                <span className="sr-only">Añadir comentario</span>
              </Button>
            </div>
            {!user && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Inicia sesión para comentar.</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
