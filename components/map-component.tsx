"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { type LatLngExpression, Icon, divIcon } from "leaflet"
import { MapPin } from "lucide-react"
import { renderToStaticMarkup } from "react-dom/server"

// Fix for default Leaflet icon paths
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"
import "leaflet-defaulticon-compatibility"

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
const DynamicCircle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), {
  ssr: false,
})
const DynamicZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), {
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

interface MapComponentProps {
  reports: Report[]
  onMarkerClick: (reportId: string) => void
  center: LatLngExpression
  zoom: number
  showUserLocation?: boolean
  userLocation?: LatLngExpression | null
  radius?: number
}

export function MapComponent({
  reports,
  onMarkerClick,
  center,
  zoom,
  showUserLocation = false,
  userLocation,
  radius,
}: MapComponentProps) {
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView(userLocation, mapRef.current.getZoom())
    }
  }, [userLocation])

  const createCustomIcon = (type: string) => {
    const iconHtml = renderToStaticMarkup(
      <div className="flex flex-col items-center">
        <MapPin className="h-8 w-8 text-red-500" />
        <span className="text-xs font-semibold text-gray-800 bg-white px-1 rounded-sm whitespace-nowrap">{type}</span>
      </div>,
    )
    return new divIcon({
      html: iconHtml,
      className: "custom-map-pin",
      iconSize: [32, 32], // Adjust size as needed
      iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
      popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
    })
  }

  return (
    <DynamicMapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
      whenCreated={(map) => (mapRef.current = map)}
      zoomControl={false} // Disable default zoom control
    >
      <DynamicTileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DynamicZoomControl position="bottomright" /> {/* Custom position for zoom control */}
      {showUserLocation && userLocation && (
        <>
          <DynamicMarker
            position={userLocation}
            icon={
              new Icon({
                iconUrl: "/placeholder-user.png", // Use a custom icon for user location
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              })
            }
          >
            <DynamicPopup>Tu ubicación actual</DynamicPopup>
          </DynamicMarker>
          {radius && (
            <DynamicCircle
              center={userLocation}
              radius={radius}
              pathOptions={{ color: "blue", fillColor: "#3388ff", fillOpacity: 0.1 }}
            />
          )}
        </>
      )}
      {reports.map((report) => (
        <DynamicMarker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createCustomIcon(report.type)}
          eventHandlers={{
            click: () => onMarkerClick(report.id),
          }}
        >
          <DynamicPopup>
            <div className="font-semibold">{report.type}</div>
            <div>{report.address}</div>
            <Button variant="link" className="p-0 h-auto" onClick={() => onMarkerClick(report.id)}>
              Ver Detalles
            </Button>
          </DynamicPopup>
        </DynamicMarker>
      ))}
    </DynamicMapContainer>
  )
}
