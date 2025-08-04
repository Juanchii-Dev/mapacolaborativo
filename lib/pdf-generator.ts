import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Report } from "@/app/page"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function generatePDF(reports: Report[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Reporte de Problemas Vecinales", 14, 22)

  doc.setFontSize(12)
  doc.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 14, 30)

  const tableColumn = ["Tipo", "Dirección", "Descripción", "Votos", "Reportado por", "Fecha"]
  const tableRows: any[] = []

  reports.forEach((report) => {
    const reportData = [
      report.type,
      report.address,
      report.description,
      report.votes.toString(),
      report.reporter_name || "Anónimo",
      format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
    ]
    tableRows.push(reportData)
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [0, 191, 255], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        // Description column
        const textLines = doc.splitTextToSize(data.cell.text, data.cell.contentWidth)
        if (textLines.length > 3) {
          // Limit description to 3 lines in table
          data.cell.text = textLines.slice(0, 3).join("\n") + "..."
        }
      }
    },
  })

  doc.save("reporte_problemas.pdf")
}
