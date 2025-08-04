import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import type { Report } from "@/app/page"

const problemTypeLabels = {
  bache: "Bache en la calle",
  luz: "Luminaria rota",
  basura: "Basura acumulada",
  inseguridad: "Problema de inseguridad",
  otro: "Otro problema",
}

export async function generatePDF(reports: Report[]) {
  const pdfDoc = await PDFDocument.create()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  const { width, height } = page.getSize()

  let yPosition = height - 50
  const margin = 50
  const lineHeight = 20

  // Título
  page.drawText("Reporte de Problemas Barriales", {
    x: margin,
    y: yPosition,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0.75, 1), // Azul eléctrico
  })

  yPosition -= 30

  // Fecha de generación
  page.drawText(`Generado el: ${new Date().toLocaleDateString("es-AR")}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  yPosition -= 40

  // Total de reportes
  page.drawText(`Total de reportes: ${reports.length}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yPosition -= 30

  // Estadísticas por tipo
  const typeStats = reports.reduce(
    (acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  page.drawText("Estadísticas por tipo:", {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yPosition -= 20

  Object.entries(typeStats).forEach(([type, count]) => {
    const label = problemTypeLabels[type as keyof typeof problemTypeLabels] || type
    page.drawText(`• ${label}: ${count} reportes`, {
      x: margin + 20,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= 15
  })

  yPosition -= 20

  // Lista de reportes
  page.drawText("Detalle de reportes:", {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  yPosition -= 25

  reports.forEach((report, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition < 100) {
      page = pdfDoc.addPage([595.28, 841.89])
      yPosition = height - 50
    }

    const typeLabel = problemTypeLabels[report.type as keyof typeof problemTypeLabels] || report.type
    const date = new Date(report.created_at).toLocaleDateString("es-AR")

    // Número y tipo
    page.drawText(`${index + 1}. ${typeLabel}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= 15

    // Fecha
    page.drawText(`Fecha: ${date}`, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 12

    // Dirección
    page.drawText(`Dirección: ${report.address}`, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 12

    // Descripción (truncada si es muy larga)
    const description =
      report.description.length > 80 ? report.description.substring(0, 80) + "..." : report.description

    page.drawText(`Descripción: ${description}`, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 12

    // Votos
    page.drawText(`Vecinos afectados: ${report.votes}`, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    })
    yPosition -= 12

    // Reportado por (si existe)
    if (report.reporter_name) {
      page.drawText(`Reportado por: ${report.reporter_name}`, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      })
      yPosition -= 12
    }

    yPosition -= 10 // Espacio entre reportes
  })

  // Generar y descargar el PDF
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `reporte-problemas-barriales-${new Date().toISOString().split("T")[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
