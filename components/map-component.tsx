"use client"

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useState, useRef } from "react"
import type { Report } from "@/app/page"
import { Button } from "@/components/ui/button"
import { MapPin, ThumbsUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface MapComponentProps {
  reports: Report[]
  onReportClick: (report: Report) => void
  initialCenter?: [number, number]
  initialZoom?: number
}

function MapEvents({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

export default function MapComponent({
  reports,
  onReportClick,
  initialCenter = [-34.6037, -58.3816],
  initialZoom = 13,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter)
  const [mapZoom, setMapZoom] = useState(initialZoom)

  useEffect(() => {
    if (mapRef.current && reports.length > 0) {
      // Calculate bounds to fit all markers
      const bounds = L.latLngBounds(reports.map((r) => [r.latitude, r.longitude]))
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [reports])

  const handleMapClick = (latlng: L.LatLng) => {
    // This can be used for future features, e.g., placing a new report marker
    console.log("Map clicked at:", latlng.lat, latlng.lng)
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg shadow-lg z-0"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMapClick={handleMapClick} />
      {reports.map((report) => (
        <Marker key={report.id} position={[report.latitude, report.longitude]}>
          <Popup>
            <div className="text-gray-900">
              <h3 className="font-bold text-lg mb-1">{report.type}</h3>
              <p className="text-sm mb-2">{report.address}</p>
              <p className="text-xs text-gray-600 mb-2">
                Reportado hace {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: es })}
              </p>
              <div className="flex items-center text-sm text-gray-700 mb-3">
                <ThumbsUp className="w-4 h-4 mr-1 text-blue-500" /> {report.votes} votos
              </div>
              <Button
                onClick={() => onReportClick(report)}
                className="w-full bg-[#00BFFF] hover:bg-[#0099CC] text-white text-xs py-1 h-auto"
              >
                <MapPin className="w-3 h-3 mr-1" /> Ver Detalles
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
