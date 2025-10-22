// PDF Generator utilities
// Currently using browser print functionality for simplicity
// Can be extended to use html2pdf.js for actual PDF generation

export interface PDFOptions {
  margin: number | [number, number, number, number]
  filename: string
  image: {
    type: string
    quality: number
  }
  html2canvas: {
    scale: number
    useCORS: boolean
    letterRendering: boolean
  }
  jsPDF: {
    unit: string
    format: string | [number, number]
    orientation: string
  }
}

// Simplified print function that opens a new window with invoice content
export const printInvoice = (element: HTMLElement): void => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('Unable to open print window')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice Print</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            color: black;
            background: white;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// Future: Generate actual PDF using html2pdf.js
// export const generateInvoicePDF = async (
//   element: HTMLElement,
//   filename: string = 'invoice.pdf'
// ): Promise<void> => {
//   // This would use html2pdf.js for actual PDF generation
//   // For now, using the print function above
//   printInvoice(element)
// }
