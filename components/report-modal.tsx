"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { geocodeAddress } from "@/lib/geocoding"
import type { Report } from "@/app/page"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (report: Omit<Report, "id" | "votes" | "status" | "created_at"> & { imageFile?: File | null }) => void
  isSubmitting?: boolean
}

const reportTypes = [
  "bache",
  "luminaria",
  "seguridad",
  "limpieza",
  "otro",
  "árbol caído",
  "inundación",
  "ruido",
  "basura",
  "transporte",
  "salud",
  "educación",
  "mascotas",
  "infraestructura",
  "servicios públicos",
]

export default function ReportModal({ isOpen, onClose, onSubmit, isSubmitting = false }: ReportModalProps) {
  const [type, setType] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setType("")
      setAddress("")
      setDescription("")
      setImageFile(null)
      setImagePreview(null)
      setLatitude(null)
      setLongitude(null)
      setLocationError(null)
    }
  }, [isOpen])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleLocateMe = async () => {
    setIsLoadingLocation(true)
    setLocationError(null)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            )
            const data = await response.json()
            if (data.display_name) {
              setAddress(data.display_name)
            } else {
              setAddress(`${latitude}, ${longitude}`)
            }
          } catch (error) {
            console.error("Error geocoding reverse:", error)
            setAddress(`${latitude}, ${longitude}`)
            setLocationError("No se pudo obtener la dirección exacta.")
          } finally {
            setIsLoadingLocation(false)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationError(
            "No se pudo obtener tu ubicación. Asegúrate de que los servicios de ubicación estén activados.",
          )
          setIsLoadingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setLocationError("La geolocalización no es compatible con tu navegador.")
      setIsLoadingLocation(false)
    }
  }

  const handleSubmit = async () => {
    if (!type || !address || !description) {
      setLocationError("Por favor, completa todos los campos obligatorios.")
      return
    }

    let finalLatitude = latitude
    let finalLongitude = longitude

    if (!finalLatitude || !finalLongitude) {
      setIsLoadingLocation(true)
      setLocationError(null)
      try {
        const coords = await geocodeAddress(address)
        if (coords) {
          finalLatitude = coords.latitude
          finalLongitude = coords.longitude
        } else {
          setLocationError("No se pudo encontrar la ubicación para la dirección proporcionada.")
          setIsLoadingLocation(false)
          return
        }
      } catch (error) {
        console.error("Error geocoding address:", error)
        setLocationError("Error al geocodificar la dirección. Intenta con una dirección más específica.")
        setIsLoadingLocation(false)
        return
      } finally {
        setIsLoadingLocation(false)
      }
    }

    onSubmit({
      type,
      address,
      description,
      imageFile,
      latitude: finalLatitude!,
      longitude: finalLongitude!,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] text-white border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-[#00BFFF]">Reportar un Problema</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-white">
              Tipo de Problema
            </Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger id="type" className="bg-[#2a2a2a] text-white border-[#333]">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2a] text-white border-[#333]">
                {reportTypes.map((t) => (
                  <SelectItem key={t} value={t} className="hover:bg-[#3a3a3a]">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address" className="text-white">
              Dirección
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. Corrientes 1234"
                className="flex-1 bg-[#2a2a2a] text-white border-[#333]"
              />
              <Button
                onClick={handleLocateMe}
                disabled={isLoadingLocation}
                variant="outline"
                className="bg-[#3a3a3a] text-white border-[#00BFFF] hover:bg-[#00BFFF] hover:text-white"
              >
                {isLoadingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mi Ubicación"}
              </Button>
            </div>
            {locationError && <p className="text-red-400 text-sm">{locationError}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema en detalle..."
              className="bg-[#2a2a2a] text-white border-[#333]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image" className="text-white">
              Imagen (Opcional)
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-[#2a2a2a] text-white border-[#333] file:text-white file:bg-[#00BFFF] file:hover:bg-[#0099CC]"
            />
            {imagePreview && (
              <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                >
                  X
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingLocation}
            className="bg-[#00BFFF] hover:bg-[#0099CC] text-white w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              "Enviar Reporte"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
