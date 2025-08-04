"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin, Upload, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { geocodeAddress } from "@/lib/geocoding"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    address: "",
    description: "",
    reporter_name: "",
    image: null as File | null,
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const problemTypes = [
    { value: "bache", label: "Bache en la calle" },
    { value: "luz", label: "Luminaria rota" },
    { value: "basura", label: "Basura acumulada" },
    { value: "inseguridad", label: "Problema de inseguridad" },
    { value: "otro", label: "Otro problema" },
  ]

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      alert("La geolocalización no está disponible en tu navegador")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Use reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          )
          const data = await response.json()

          setFormData((prev) => ({
            ...prev,
            address: data.display_name || `${latitude}, ${longitude}`,
            latitude,
            longitude,
          }))
        } catch (error) {
          setFormData((prev) => ({
            ...prev,
            address: `${latitude}, ${longitude}`,
            latitude,
            longitude,
          }))
        }

        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("No se pudo obtener tu ubicación. Verifica los permisos de ubicación.")
        setIsGettingLocation(false)
      },
    )
  }

  const handleAddressSearch = async () => {
    if (!formData.address.trim()) {
      alert("Ingresa una dirección para buscar")
      return
    }

    setIsGeocodingAddress(true)

    try {
      const coordinates = await geocodeAddress(formData.address)
      if (coordinates) {
        setFormData((prev) => ({
          ...prev,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }))
        setErrors((prev) => ({ ...prev, location: "" }))
      } else {
        setErrors((prev) => ({ ...prev, location: "No se pudo encontrar la dirección. Verifica que sea correcta." }))
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      setErrors((prev) => ({ ...prev, location: "Error al buscar la dirección. Intenta nuevamente." }))
    } finally {
      setIsGeocodingAddress(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. El tamaño máximo es 5MB.")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten archivos de imagen.")
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.type) newErrors.type = "Selecciona el tipo de problema"
    if (!formData.description.trim()) newErrors.description = "Describe el problema"
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Obtén tu ubicación o busca una dirección válida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let imageUrl = null

      // Upload image if exists
      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("report-images")
          .upload(fileName, formData.image)

        if (uploadError) {
          console.error("Error uploading image:", uploadError)
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from("report-images").getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      await onSubmit({
        type: formData.type,
        address: formData.address.trim() || `${formData.latitude}, ${formData.longitude}`,
        description: formData.description.trim(),
        reporter_name: formData.reporter_name.trim() || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        image_url: imageUrl,
      })

      // Reset form
      setFormData({
        type: "",
        address: "",
        description: "",
        reporter_name: "",
        image: null,
        latitude: null,
        longitude: null,
      })
      setErrors({})
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Error al enviar el reporte. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: "",
      address: "",
      description: "",
      reporter_name: "",
      image: null,
      latitude: null,
      longitude: null,
    })
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#121212] border-[#333] text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#00BFFF]">Reportar un problema</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type" className="text-white">
              Tipo de problema *
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectValue placeholder="Selecciona el tipo de problema" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                {problemTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#333]">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <Label htmlFor="address" className="text-white">
              Dirección (opcional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddressSearch}
                disabled={isGeocodingAddress || !formData.address.trim()}
                className="bg-[#39FF14] hover:bg-[#2ECC11] text-black min-w-[44px]"
                size="sm"
              >
                {isGeocodingAddress ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ingresa una dirección y presiona buscar, o usa tu ubicación actual
            </p>
          </div>

          <div>
            <Label className="text-white">Ubicación *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="bg-[#00BFFF] hover:bg-[#0099CC] text-white flex-1"
                size="sm"
              >
                {isGettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Obteniendo...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Usar mi ubicación
                  </>
                )}
              </Button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-green-400 mt-1">
                ✓ Ubicación obtenida: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            )}
            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Descripción del problema *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe brevemente el problema que encontraste..."
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-400"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500 caracteres</p>
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="image" className="text-white">
              Foto (opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-[#1a1a1a] border-[#333] text-white file:bg-[#00BFFF] file:text-white file:border-0 file:rounded file:px-2 file:py-1"
              />
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Máximo 5MB. Formatos: JPG, PNG, GIF</p>
            {formData.image && (
              <p className="text-xs text-green-400 mt-1">✓ Imagen seleccionada: {formData.image.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reporter_name" className="text-white">
              Tu nombre (opcional)
            </Label>
            <Input
              id="reporter_name"
              value={formData.reporter_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, reporter_name: e.target.value }))}
              placeholder="Nombre del vecino"
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-400"
              maxLength={100}
            />
            <p className="text-xs text-gray-400 mt-1">Opcional. Ayuda a la comunidad a saber quién reportó.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#00BFFF] hover:bg-[#0099CC] text-white">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                "Enviar reporte"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
