import jsPDF from "jspdf";
import "jspdf-autotable";
import { ColumnDef } from "@tanstack/react-table";

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  selectedRowsOnly?: boolean;
}

export class ExportService {
  static exportToPDF<T>(
    data: T[],
    columns: ColumnDef<T, any>[],
    options: ExportOptions
  ) {
    const { filename = "export", includeHeaders = true } = options;

    // Filter out image and agent columns for PDF export
    const filteredColumns = columns.filter((col) => {
      const columnId = col.id || (col as any).accessorKey;
      return columnId !== "images" && columnId !== "agent" && columnId !== "select" && columnId !== "actions";
    });

    // Prepare headers
    const headers = filteredColumns.map((col) =>
      typeof col.header === "string" ? col.header : col.id || (col as any).accessorKey
    );

    // Prepare rows with preprocessing and formatting
    const rows = data.map((item) =>
      filteredColumns.map((col) => {
        const columnId = col.id || (col as any).accessorKey;
        const value = item[columnId as keyof T];

        if (value === null || value === undefined) return "";

        // Handle arrays (like features)
        if (Array.isArray(value)) {
          return value.join(" | ");
        }

        // Handle objects (like dates)
        if (typeof value === "object") {
          return JSON.stringify(value);
        }

        // Format specific columns for better readability
        if (columnId === "price") {
          const currency = item["currency" as keyof T] || "RWF";
          const price = Number(value);
          return `${currency} ${price.toLocaleString()}`;
        }

        if (columnId === "furnished") {
          return value ? "Yes" : "No";
        }

        if (columnId === "isDeal") {
          return value ? "Deal" : "No Deal";
        }

        if (columnId === "status") {
          return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
        }

        if (columnId === "type") {
          return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
        }

        // Handle numeric values
        if (typeof value === "number") {
          return value.toLocaleString();
        }

        // Primitive values
        return String(value);
      })
    );

    const doc = new jsPDF();

    // Add title and metadata
    doc.setProperties({
      title: `${filename} - Property Export`,
      subject: 'Real Estate Properties Export',
      author: 'Manron Dashboard',
      creator: 'Manron Dashboard System'
    });

    // Add header with logo and title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Manron Real Estate', 20, 20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Property List Export', 20, 30);

    // Add export date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 40);

    // Add line separator
    doc.setDrawColor(22, 160, 133);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Generate the table with improved styling and colors
    (doc as any).autoTable({
      startY: 50,
      head: includeHeaders ? [headers] : undefined,
      body: rows,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        textColor: [50, 50, 50],
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        // Alternating two-color scheme
        0: { cellWidth: 30, fillColor: [240, 248, 255] }, // Light blue
        1: { cellWidth: 25, fillColor: [240, 255, 240] }, // Light green
        2: { cellWidth: 20, fillColor: [240, 248, 255] }, // Light blue
        3: { cellWidth: 15, fillColor: [240, 255, 240] }, // Light green
        4: { cellWidth: 15, fillColor: [240, 248, 255] }, // Light blue
        5: { cellWidth: 12, fillColor: [240, 255, 240] }, // Light green
        6: { cellWidth: 12, fillColor: [240, 248, 255] }, // Light blue
        7: { cellWidth: 12, fillColor: [240, 255, 240] }, // Light green
        8: { cellWidth: 12, fillColor: [240, 248, 255] }, // Light blue
        9: { cellWidth: 12, fillColor: [240, 255, 240] }, // Light green
        10: { cellWidth: 12, fillColor: [240, 248, 255] }, // Light blue
        11: { cellWidth: 12, fillColor: [240, 255, 240] }, // Light green
        12: { cellWidth: 12, fillColor: [240, 248, 255] }, // Light blue
        13: { cellWidth: 12, fillColor: [240, 255, 240] }  // Light green
      },
      margin: { top: 50, right: 20, bottom: 20, left: 20 },
      tableWidth: 'auto',
      showHead: 'everyPage',
      pageBreak: 'auto',
      didDrawPage: function (data: any) {
        // Ensure colors are preserved on each page
        data.table.body.forEach((row: any, rowIndex: number) => {
          row.forEach((cell: any, cellIndex: number) => {
            const columnStyles = data.table.getColumnStyles();
            if (columnStyles[cellIndex]) {
              cell.fillColor = columnStyles[cellIndex].fillColor;
            }
          });
        });
      }
    });

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('Manron Real Estate Dashboard', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
    }

    doc.save(`${filename}.pdf`);
  }
}
