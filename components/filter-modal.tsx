"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface FilterOptions {
  type: string
  status: string
  radius: number
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export function FilterModal({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
  const [type, setType] = useState(currentFilters.type)
  const [status, setStatus] = useState(currentFilters.status)
  const [radius, setRadius] = useState(currentFilters.radius)

  const handleApply = () => {
    onApplyFilters({ type, status, radius })
    onClose()
  }

  const handleReset = () => {
    setType("all")
    setStatus("all")
    setRadius(5000) // Default radius
    onApplyFilters({ type: "all", status: "all", radius: 5000 })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Reportes</DialogTitle>
          <DialogDescription>Ajusta los filtros para encontrar reportes específicos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Bache">Bache</SelectItem>
                <SelectItem value="Falla de alumbrado">Falla de alumbrado</SelectItem>
                <SelectItem value="Basura acumulada">Basura acumulada</SelectItem>
                <SelectItem value="Vandalismo">Vandalismo</SelectItem>
                <SelectItem value="Inundación">Inundación</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Estado
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="radius" className="text-right">
              Radio (m)
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Slider
                id="radius"
                min={100}
                max={10000}
                step={100}
                value={[radius]}
                onValueChange={(val) => setRadius(val[0])}
                className="w-[calc(100%-60px)]"
              />
              <Input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-16 text-center"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Restablecer
          </Button>
          <Button onClick={handleApply}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
