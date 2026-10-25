import type { Appointment, Client } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function appointmentsToCsv(items: Appointment[]): string {
  const header = [
    "Título",
    "Categoria",
    "Data",
    "Início",
    "Fim",
    "Contato",
    "Telefone",
    "Endereço",
    "Descrição",
    "Status",
  ].join(";");

  const rows = items.map((a) =>
    [
      a.title,
      CATEGORY_LABELS[a.category],
      a.date,
      a.startTime,
      a.endTime,
      a.contactName,
      a.phone,
      a.address,
      a.description,
      STATUS_LABELS[a.status],
    ]
      .map(escapeCsv)
      .join(";")
  );

  return [header, ...rows].join("\n");
}

export function clientsToCsv(items: Client[]): string {
  const header = ["Nome", "Telefone", "Observações"].join(";");
  const rows = items.map((c) =>
    [c.name, c.phone, c.notes].map(escapeCsv).join(";")
  );
  return [header, ...rows].join("\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mime = "text/csv;charset=utf-8"
) {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
