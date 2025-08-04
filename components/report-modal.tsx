"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin } from "lucide-react"
import { supabaseHelpers } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast" // Corrected import path for useToast
import { useAuth } from "@/components/supabase-auth-provider"
import { getAddressFromCoordinates } from "@/lib/geocoding"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onReportCreated: () => void
  initialLocation?: { lat: number; lng: number } | null
}

export function ReportModal({ isOpen, onClose, onReportCreated, initialLocation }: ReportModalProps) {
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && initialLocation) {
      setLatitude(initialLocation.lat)
      setLongitude(initialLocation.lng)
      fetchAddress(initialLocation.lat, initialLocation.lng)
    } else if (!isOpen) {
      // Reset form when modal closes
      setType("")
      setDescription("")
      setImageFile(null)
      setLatitude(null)
      setLongitude(null)
      setAddress("")
    }
  }, [isOpen, initialLocation])

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLocating(true)
    try {
      const fetchedAddress = await getAddressFromCoordinates(lat, lng)
      setAddress(fetchedAddress || "Dirección no encontrada")
    } catch (error) {
      console.error("Error fetching address:", error)
      setAddress("Error al obtener dirección")
      toast({
        title: "Error de geocodificación",
        description: "No se pudo obtener la dirección para las coordenadas seleccionadas.",
        variant: "destructive",
      })
    } finally {
      setIsLocating(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleLocateMe = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)
          await fetchAddress(latitude, longitude)
          toast({
            title: "Ubicación obtenida",
            description: "Tu ubicación actual ha sido cargada.",
          })
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting geolocation:", error)
          toast({
            title: "Error de ubicación",
            description:
              "No se pudo obtener tu ubicación actual. Asegúrate de que los servicios de ubicación estén habilitados.",
            variant: "destructive",
          })
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      toast({
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta la geolocalización.",
        variant: "destructive",
      })
      setIsLocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !address || latitude === null || longitude === null) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa el tipo, la dirección y la ubicación del reporte.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const reportData = {
        type,
        address,
        description: description || null,
        latitude,
        longitude,
        imageFile,
      }
      const { data, error } = await supabaseHelpers.createReport(reportData)

      if (error) {
        throw error
      }

      toast({
        title: "Reporte Creado",
        description: "Tu reporte ha sido enviado exitosamente.",
      })
      onReportCreated()
      onClose()
    } catch (error: any) {
      console.error("Error submitting report:", error.message)
      toast({
        title: "Error al crear reporte",
        description: `No se pudo enviar el reporte: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reportar un Problema</DialogTitle>
          <DialogDescription>Describe el problema que has encontrado en tu comunidad.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Problema</Label>
            <Select value={type} onValueChange={setType} disabled={isSubmitting}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bache">Bache</SelectItem>
                <SelectItem value="Falla de alumbrado">Falla de alumbrado</SelectItem>
                <SelectItem value="Basura acumulada">Basura acumulada</SelectItem>
                <SelectItem value="Vandalismo">Vandalismo</SelectItem>
                <SelectItem value="Inundación">Inundación</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el problema en detalle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Imagen (Opcional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            {imageFile && <p className="text-sm text-muted-foreground">Archivo seleccionado: {imageFile.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Ubicación</Label>
            <div className="flex items-center gap-2">
              <Input
                id="address"
                placeholder="Dirección del problema"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSubmitting || isLocating || (latitude !== null && longitude !== null)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleLocateMe}
                disabled={isLocating || isSubmitting}
              >
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                <span className="sr-only">Obtener ubicación actual</span>
              </Button>
            </div>
            {latitude !== null && longitude !== null && (
              <p className="text-sm text-muted-foreground">
                Coordenadas: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !type || !address || latitude === null || longitude === null}
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
