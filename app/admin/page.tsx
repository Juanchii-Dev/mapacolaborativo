"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState, useCallback } from "react"
import type { Report } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "@/components/supabase-auth-provider"
import AuthForm from "@/components/auth-form"
import Loading from "@/app/loading"
import { supabaseHelpers } from "@/lib/supabase"

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)

  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true)
    const { data, error } = await supabaseHelpers.getAllReports()

    if (error) {
      console.error("Error fetching reports for admin:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes para la administración.",
        variant: "destructive",
      })
    } else {
      setReports(data || [])
    }
    setIsLoadingReports(false)
  }, [toast])

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchReports()
    }
  }, [fetchReports, isAuthLoading, user])

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión como administrador para cambiar el estado.",
        variant: "destructive",
      })
      return
    }

    // Basic check if user is an admin (this should be reinforced with RLS on Supabase)
    // For a real app, you'd check a role or a specific admin table.
    // For now, we'll assume any logged-in user can try, but RLS will prevent non-admins.

    const { error } = await supabaseHelpers.updateReportStatus(reportId, newStatus)

    if (error) {
      console.error("Error updating report status:", error)
      toast({
        title: "Error al actualizar estado",
        description: "No tienes permisos o hubo un problema al actualizar el estado.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Estado actualizado",
        description: "El estado del reporte ha sido modificado.",
      })
      fetchReports() // Refresh reports to show updated status
    }
  }

  if (isAuthLoading) {
    return <Loading />
  }

  if (!user) {
    return <AuthForm /> // Redirect to auth if not logged in
  }

  // In a real app, you'd check if the user has admin role here
  // For this example, we'll just show the admin page if logged in.
  // You should implement proper role-based access control.

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <h1 className="text-3xl font-bold text-[#00BFFF] mb-6">Panel de Administración de Reportes</h1>

      {isLoadingReports ? (
        <Loading />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.length === 0 ? (
            <p className="text-gray-400">No hay reportes para administrar.</p>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="bg-[#1a1a1a] text-white border-[#333]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-[#00BFFF]">{report.type}</CardTitle>
                  <p className="text-sm text-gray-300">{report.address}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-gray-200 line-clamp-3">{report.description}</p>
                  <div className="text-xs text-gray-400">
                    <p>Reportado por: {report.reporter_name || "Anónimo"}</p>
                    <p>Fecha: {format(new Date(report.created_at), "dd MMMM yyyy HH:mm", { locale: es })}</p>
                    <p>Votos: {report.votes}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor={`status-${report.id}`} className="text-white">
                      Estado:
                    </Label>
                    <Select
                      value={report.status || "pending"}
                      onValueChange={(value) => handleStatusChange(report.id, value)}
                    >
                      <SelectTrigger
                        id={`status-${report.id}`}
                        className="flex-1 bg-[#2a2a2a] text-white border-[#333]"
                      >
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] text-white border-[#333]">
                        <SelectItem value="pending" className="hover:bg-[#3a3a3a]">
                          Pendiente
                        </SelectItem>
                        <SelectItem value="in_progress" className="hover:bg-[#3a3a3a]">
                          En Progreso
                        </SelectItem>
                        <SelectItem value="resolved" className="hover:bg-[#3a3a3a]">
                          Resuelto
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
