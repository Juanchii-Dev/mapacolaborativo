"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Report } from "@/app/page"

interface MapComponentProps {
  reports: Report[]
  onReportClick: (report: Report) => void
}

const getMarkerColor = (type: string) => {
  const colors = {
    bache: "#FF4444",
    luz: "#FFAA00",
    basura: "#44AA44",
    inseguridad: "#AA44AA",
    otro: "#00BFFF",
  }
  return colors[type as keyof typeof colors] || "#00BFFF"
}

export default function MapComponent({ reports, onReportClick }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [L, setL] = useState<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      // Dynamic import with retry logic
      const leaflet = await import("leaflet")

      // Fix for default markers
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      setL(leaflet)

      // Initialize map centered on Buenos Aires
      const map = leaflet
        .map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          dragging: true,
          attributionControl: false,
        })
        .setView([-34.6037, -58.3816], 12)

      // Add dark tile layer with error handling
      const tileLayer = leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        })
        .on("tileerror", (e: any) => {
          console.warn("Tile loading error:", e)
        })
        .addTo(map)

      // Add attribution control
      leaflet.control.attribution({ position: "bottomright" }).addTo(map)

      mapInstanceRef.current = map
      setIsLoading(false)
      setRetryCount(0)
    } catch (error) {
      console.error("Error loading Leaflet:", error)
      setError("Error al cargar el mapa. Intenta recargar la página.")
      setIsLoading(false)
    }
  }, [])

  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !L) return

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        try {
          mapInstanceRef.current.removeLayer(marker)
        } catch (e) {
          console.warn("Error removing marker:", e)
        }
      })
      markersRef.current = []

      // Add new markers
      reports.forEach((report, index) => {
        try {
          const color = getMarkerColor(report.type)

          const customIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="
                background-color: ${color}; 
                width: 28px; 
                height: 28px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                z-index: ${1000 + index};
              ">
                ${report.votes > 0 ? report.votes : ""}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })

          const marker = L.marker([report.latitude, report.longitude], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .on("click", () => {
              onReportClick(report)
            })
            .on("mouseover", function () {
              const element = this.getElement()
              if (element) {
                element.style.transform = "scale(1.2)"
                element.style.zIndex = "2000"
              }
            })
            .on("mouseout", function () {
              const element = this.getElement()
              if (element) {
                element.style.transform = "scale(1)"
                element.style.zIndex = `${1000 + index}`
              }
            })

          markersRef.current.push(marker)
        } catch (error) {
          console.error("Error creating marker for report:", report.id, error)
        }
      })

      // Fit map to show all markers if there are any
      if (reports.length > 0 && markersRef.current.length > 0) {
        try {
          const group = new L.featureGroup(markersRef.current)
          const bounds = group.getBounds()
          if (bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds.pad(0.1), {
              maxZoom: 15,
              animate: true,
              duration: 1,
            })
          }
        } catch (error) {
          console.error("Error fitting bounds:", error)
        }
      }
    } catch (error) {
      console.error("Error updating markers:", error)
    }
  }, [reports, onReportClick, L])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
    initializeMap()
  }

  useEffect(() => {
    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (error) {
          console.warn("Error cleaning up map:", error)
        }
      }
    }
  }, [initializeMap])

  useEffect(() => {
    if (mapInstanceRef.current && L) {
      updateMarkers()
    }
  }, [updateMarkers])

  if (error) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white rounded-lg">
        <div className="text-center p-4">
          <div className="text-red-400 mb-2 text-2xl">⚠️</div>
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-[#00BFFF] text-white rounded text-sm hover:bg-[#0099CC] transition-colors"
          >
            Reintentar {retryCount > 0 && `(${retryCount})`}
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BFFF] mx-auto mb-2"></div>
          <p className="text-sm">Cargando mapa...</p>
          {retryCount > 0 && <p className="text-xs text-gray-400 mt-1">Intento {retryCount + 1}</p>}
        </div>
      </div>
    )
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "200px" }} />
    </>
  )
}
