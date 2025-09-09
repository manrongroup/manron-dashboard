import jsPDF from "jspdf";
import "jspdf-autotable";
import { ColumnDef } from "@tanstack/react-table";
import { ExportOptions } from "./index";

export class ExportService {
  static exportToPDF<T>(
    data: T[],
    columns: ColumnDef<T, any>[],
    options: ExportOptions
  ) {
    const { filename = "export", includeHeaders = true } = options;

    // Prepare headers
    const headers = columns.map((col) =>
      typeof col.header === "string" ? col.header : col.id
    );

    // Prepare rows with preprocessing
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = item[col.id as keyof T];

        if (value === null || value === undefined) return "";

        // Handle arrays (like images)
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object" && "url" in value[0]) {
            return value.map((v: any) => v.url).join(" | ");
          }
          return value.join(" | ");
        }

        // Handle objects (like agent)
        if (typeof value === "object") {
          if ("name" in value && "email" in value) {
            return `${value.name} (${value.email})`;
          }
          return JSON.stringify(value);
        }

        // Primitive values
        return String(value);
      })
    );

    const doc = new jsPDF();
    (doc as any).autoTable({
      head: includeHeaders ? [headers] : undefined,
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`${filename}.pdf`);
  }
}
