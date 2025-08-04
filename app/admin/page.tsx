"use client"

import { useEffect, useState } from "react"
import { supabaseHelpers } from "@/lib/supabase"
import { useAuth } from "@/components/supabase-auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Corrected import path for useToast
import { ViewReportModal } from "@/components/view-report-modal"

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

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && (!user || !user.user_metadata?.is_admin)) {
      // Redirect if not authenticated or not an admin
      router.push("/")
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos para acceder a esta página.",
        variant: "destructive",
      })
    } else if (user && user.user_metadata?.is_admin) {
      fetchReports()
    }
  }, [user, authLoading, router, toast])

  const fetchReports = async () => {
    setIsLoadingReports(true)
    const { data, error } = await supabaseHelpers.getAllReports()
    if (error) {
      console.error("Error fetching reports for admin:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes.",
        variant: "destructive",
      })
    } else {
      setReports(data || [])
    }
    setIsLoadingReports(false)
  }

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    const originalReports = [...reports]
    setReports((prev) =>
      prev.map((report) => (report.id === reportId ? { ...report, status: newStatus as Report["status"] } : report)),
    )
    const { data, error } = await supabaseHelpers.updateReportStatus(reportId, newStatus)
    if (error) {
      console.error("Error updating report status:", error)
      setReports(originalReports) // Revert on error
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reporte.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Estado Actualizado",
        description: `El estado del reporte ${reportId.substring(0, 8)}... ha sido actualizado a ${newStatus}.`,
      })
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este reporte? Esta acción es irreversible.")) {
      return
    }
    const originalReports = [...reports]
    setReports((prev) => prev.filter((report) => report.id !== reportId))
    const { error } = await supabaseHelpers.deleteReport(reportId)
    if (error) {
      console.error("Error deleting report:", error)
      setReports(originalReports) // Revert on error
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Reporte Eliminado",
        description: `El reporte ${reportId.substring(0, 8)}... ha sido eliminado.`,
      })
    }
  }

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReportId(null)
    fetchReports() // Refresh reports after modal closes (in case of changes)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default"
      case "in_progress":
        return "secondary"
      case "resolved":
        return "success"
      default:
        return "default"
    }
  }

  if (authLoading || (user && !user.user_metadata?.is_admin && !isLoadingReports)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Panel de Administración de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2">Cargando reportes...</span>
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-500">No hay reportes para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Votos</TableHead>
                    <TableHead>Reportado por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.type}</TableCell>
                      <TableCell>{report.address}</TableCell>
                      <TableCell>
                        <Select value={report.status} onValueChange={(value) => handleStatusChange(report.id, value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <Badge variant={getStatusBadgeVariant("pending")}>Pendiente</Badge>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <Badge variant={getStatusBadgeVariant("in_progress")}>En Progreso</Badge>
                            </SelectItem>
                            <SelectItem value="resolved">
                              <Badge variant={getStatusBadgeVariant("resolved")}>Resuelto</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{report.votes}</TableCell>
                      <TableCell>{report.reporter_name || "Anónimo"}</TableCell>
                      <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewReport(report.id)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteReport(report.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <ViewReportModal
        reportId={selectedReportId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReportUpdated={fetchReports} // Pass fetchReports to refresh list after update
      />
    </div>
  )
}
