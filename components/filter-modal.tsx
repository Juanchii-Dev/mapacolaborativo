"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    types: string[]
    zone: string
  }
  onFiltersChange: (filters: { types: string[]; zone: string }) => void
}

const problemTypes = [
  { value: "bache", label: "Baches en la calle" },
  { value: "luz", label: "Luminarias rotas" },
  { value: "basura", label: "Basura acumulada" },
  { value: "inseguridad", label: "Problemas de inseguridad" },
  { value: "otro", label: "Otros problemas" },
]

export default function FilterModal({ isOpen, onClose, filters, onFiltersChange }: FilterModalProps) {
  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked ? [...filters.types, type] : filters.types.filter((t) => t !== type)

    onFiltersChange({ ...filters, types: newTypes })
  }

  const handleZoneChange = (zone: string) => {
    onFiltersChange({ ...filters, zone })
  }

  const clearFilters = () => {
    onFiltersChange({ types: [], zone: "" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-[#333] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#00BFFF]">Filtrar reportes</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtro por tipo */}
          <div>
            <Label className="text-white font-medium mb-3 block">Tipo de problema</Label>
            <div className="space-y-2">
              {problemTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={filters.types.includes(type.value)}
                    onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                    className="border-[#333] data-[state=checked]:bg-[#00BFFF] data-[state=checked]:border-[#00BFFF]"
                  />
                  <Label htmlFor={type.value} className="text-sm text-gray-300 cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtro por zona */}
          <div>
            <Label htmlFor="zone" className="text-white font-medium mb-2 block">
              Zona/Barrio/Comuna
            </Label>
            <Input
              id="zone"
              value={filters.zone}
              onChange={(e) => handleZoneChange(e.target.value)}
              placeholder="Ej: Palermo, Comuna 14, etc."
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-400"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="flex-1 border-[#333] text-white hover:bg-[#1a1a1a] bg-transparent"
            >
              Limpiar filtros
            </Button>
            <Button onClick={onClose} className="flex-1 bg-[#00BFFF] hover:bg-[#0099CC] text-white">
              Aplicar filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
