"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    types: string[]
    zone: string
  }
  onFiltersChange: (filters: { types: string[]; zone: string }) => void
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

export default function FilterModal({ isOpen, onClose, filters, onFiltersChange }: FilterModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(filters.types)
  const [zoneInput, setZoneInput] = useState<string>(filters.zone)

  useEffect(() => {
    setSelectedTypes(filters.types)
    setZoneInput(filters.zone)
  }, [filters])

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)))
  }

  const handleApplyFilters = () => {
    onFiltersChange({ types: selectedTypes, zone: zoneInput })
    onClose()
  }

  const handleClearFilters = () => {
    setSelectedTypes([])
    setZoneInput("")
    onFiltersChange({ types: [], zone: "" })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-[#00BFFF]">Filtrar Reportes</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="zone" className="text-white">
              Zona / Dirección
            </Label>
            <Input
              id="zone"
              value={zoneInput}
              onChange={(e) => setZoneInput(e.target.value)}
              placeholder="Ej: Palermo, Av. Corrientes 123"
              className="bg-[#2a2a2a] text-white border-[#333]"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-white">Tipo de Problema</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {reportTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                    className="border-[#00BFFF] data-[state=checked]:bg-[#00BFFF] data-[state=checked]:text-white"
                  />
                  <Label htmlFor={`type-${type}`} className="capitalize text-white">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
          >
            Limpiar Filtros
          </Button>
          <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-[#00BFFF] hover:bg-[#0099CC] text-white">
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
