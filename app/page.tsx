"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Plus, Filter, FileText, Map, List, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import ReportModal from "@/components/report-modal"
import FilterModal from "@/components/filter-modal"
import ViewReportModal from "@/components/view-report-modal"
import ReportsList from "@/components/reports-list"
import Header from "@/components/header"
import { supabase, supabaseHelpers } from "@/lib/supabase"
import { generatePDF } from "@/lib/pdf-generator"
import { sampleReports } from "@/lib/sample-data"
import { toast } from "@/hooks/use-toast"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BFFF] mx-auto mb-2"></div>
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
})

export interface Report {
  id: string
  type: string
  address: string
  description: string
  image_url?: string
  reporter_name?: string
  latitude: number
  longitude: number
  votes: number
  created_at: string
  status?: string
}

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("list")
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "offline" | "connecting">("connecting")
  const [filters, setFilters] = useState({
    types: [] as string[],
    zone: "",
  })

  const loadReports = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true)
    if (!showRefreshIndicator) setIsLoading(true)

    try {
      setConnectionStatus("connecting")
      const { data, error } = await supabaseHelpers.getAllReports()

      if (error) {
        console.error("Error loading reports:", error)
        setReports(sampleReports)
        setConnectionStatus("offline")
        if (!showRefreshIndicator) {
          toast({
            title: "Modo offline",
            description: "Mostrando datos de ejemplo. Verifica tu conexión.",
            variant: "destructive",
          })
        }
      } else {
        const reportsData = data || []
        setReports(reportsData.length > 0 ? reportsData : sampleReports)
        setConnectionStatus("connected")
        if (showRefreshIndicator && reportsData.length > 0) {
          toast({
            title: "Datos actualizados",
            description: `Se cargaron ${reportsData.length} reportes.`,
          })
        }
      }
    } catch (error) {
      console.error("Supabase connection error:", error)
      setReports(sampleReports)
      setConnectionStatus("offline")
      if (!showRefreshIndicator) {
        toast({
          title: "Modo offline",
          description: "Mostrando datos de ejemplo. Verifica tu conexión.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadReports()

    // Set up real-time subscription
    let subscription: any = null

    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel("reports_realtime")
          .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, (payload) => {
            console.log("Real-time update received:", payload)
            loadReports(false) // Reload without showing refresh indicator
          })
          .subscribe((status) => {
            console.log("Subscription status:", status)
            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected")
            }
          })
      } catch (error) {
        console.error("Error setting up subscription:", error)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [loadReports])

  useEffect(() => {
    let filtered = reports

    if (filters.types.length > 0) {
      filtered = filtered.filter((report) => filters.types.includes(report.type))
    }

    if (filters.zone) {
      filtered = filtered.filter((report) => report.address.toLowerCase().includes(filters.zone.toLowerCase()))
    }

    setFilteredReports(filtered)
  }, [reports, filters])

  const handleReportSubmit = async (reportData: any) => {
    try {
      const { data, error } = await supabaseHelpers.createReport({
        type: reportData.type,
        address: reportData.address,
        description: reportData.description,
        image_url: reportData.image_url,
        reporter_name: reportData.reporter_name,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        votes: 0,
      })

      if (error) {
        console.error("Error creating report:", error)
        // Add to local state as fallback
        const newReport: Report = {
          id: Date.now().toString(),
          ...reportData,
          votes: 0,
          created_at: new Date().toISOString(),
        }
        setReports((prev) => [newReport, ...prev])
        toast({
          title: "Reporte guardado localmente",
          description: "El reporte se guardó en modo offline.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "¡Reporte enviado!",
          description: "Tu reporte ha sido publicado exitosamente.",
        })
        // The real-time subscription will update the list automatically
      }

      setShowReportModal(false)
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (reportId: string) => {
    try {
      // Generate a simple fingerprint based on browser characteristics
      const fingerprint = btoa(
        `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}-${new Date().getDate()}`,
      ).substring(0, 32)

      const { data, error } = await supabaseHelpers.addVoteToReport(reportId, fingerprint)

      if (error) {
        console.error("Error voting:", error)

        if (error.message?.includes("Ya has votado")) {
          toast({
            title: "Ya votaste",
            description: "Ya registraste tu voto para este problema anteriormente.",
            variant: "destructive",
          })
          return
        }

        // Update local state as fallback
        setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, votes: r.votes + 1 } : r)))
        toast({
          title: "Voto registrado localmente",
          description: "Tu voto se guardó en modo offline.",
          variant: "destructive",
        })
        return
      }

      if (data) {
        toast({
          title: "¡Voto registrado!",
          description: "Gracias por reportar que este problema también te afecta.",
        })
        // Force refresh to get updated vote count
        await loadReports(false)
      } else {
        toast({
          title: "Ya votaste",
          description: "Ya registraste tu voto para este problema anteriormente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error al votar",
        description: "No se pudo registrar tu voto. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleGeneratePDF = async () => {
    try {
      await generatePDF(filteredReports)
      toast({
        title: "PDF generado",
        description: "El reporte se ha descargado exitosamente.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const getActiveFiltersCount = () => {
    return filters.types.length + (filters.zone ? 1 : 0)
  }

  const clearAllFilters = () => {
    setFilters({ types: [], zone: "" })
    toast({
      title: "Filtros limpiados",
      description: "Se muestran todos los reportes.",
    })
  }

  const handleRefresh = () => {
    loadReports(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFFF] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Cargando aplicación...</h2>
          <p className="text-gray-400">Preparando el mapa colaborativo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <Header
        totalReports={filteredReports.length}
        activeFilters={getActiveFiltersCount()}
        connectionStatus={connectionStatus}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "outline"}
              className={
                viewMode === "list"
                  ? "bg-[#00BFFF] hover:bg-[#0099CC] text-white"
                  : "border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
              }
              size="sm"
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
            <Button
              onClick={() => setViewMode("map")}
              variant={viewMode === "map" ? "default" : "outline"}
              className={
                viewMode === "map"
                  ? "bg-[#00BFFF] hover:bg-[#0099CC] text-white"
                  : "border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
              }
              size="sm"
            >
              <Map className="w-4 h-4 mr-2" />
              Mapa
            </Button>
            <Button
              onClick={() => setViewMode("split")}
              variant={viewMode === "split" ? "default" : "outline"}
              className={
                viewMode === "split"
                  ? "bg-[#00BFFF] hover:bg-[#0099CC] text-white"
                  : "border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
              }
              size="sm"
            >
              Vista mixta
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Actualizando..." : "Actualizar"}
            </Button>
            <Button
              onClick={() => setShowFilterModal(true)}
              className="bg-[#39FF14] hover:bg-[#2ECC11] text-black"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrar {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
                size="sm"
              >
                Limpiar
              </Button>
            )}
            <Button onClick={handleGeneratePDF} className="bg-[#00BFFF] hover:bg-[#0099CC] text-white" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Lista de reportes */}
          {(viewMode === "list" || viewMode === "split") && (
            <div className={`${viewMode === "list" ? "lg:col-span-2" : ""}`}>
              <ReportsList reports={filteredReports} onReportClick={setSelectedReport} />
            </div>
          )}

          {/* Mapa */}
          {(viewMode === "map" || viewMode === "split") && (
            <div className={`relative ${viewMode === "map" ? "lg:col-span-2" : ""}`}>
              <div className="bg-[#1a1a1a] rounded-lg overflow-hidden h-full">
                {/* Map Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#333]">
                  <h3 className="text-sm font-medium text-white">Mapa de Problemas</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{filteredReports.length} reportes</span>
                    {viewMode === "split" && (
                      <Button
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1"
                      >
                        {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Map Content */}
                <div
                  className={`transition-all duration-300 ${
                    viewMode === "split" && !isMapExpanded ? "h-64" : "h-full"
                  }`}
                >
                  <MapComponent
                    reports={filteredReports}
                    onReportClick={setSelectedReport}
                    key={`${viewMode}-${filteredReports.length}`} // Force re-render when data changes
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowReportModal(true)}
          className="bg-[#00BFFF] hover:bg-[#0099CC] text-white shadow-lg rounded-full w-14 h-14 transition-transform hover:scale-110"
          size="lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Modales */}
      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={handleReportSubmit} />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <ViewReportModal report={selectedReport} onClose={() => setSelectedReport(null)} onVote={handleVote} />

      {/* Expanded Map Overlay */}
      {isMapExpanded && viewMode === "split" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h3 className="text-lg font-medium text-white">Mapa Expandido</h3>
              <Button
                onClick={() => setIsMapExpanded(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <MapComponent reports={filteredReports} onReportClick={setSelectedReport} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
