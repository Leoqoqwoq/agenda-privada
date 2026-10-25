import type { Appointment } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/constants";
import { combineDateAndTime } from "@/lib/dates";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsUtc(date: Date): string {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function appointmentsToIcs(items: Appointment[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agenda Privada//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const a of items) {
    const start = combineDateAndTime(a.date, a.startTime);
    const end = combineDateAndTime(a.date, a.endTime);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}@agenda-privada`,
      `DTSTAMP:${toIcsUtc(new Date())}`,
      `DTSTART:${toIcsUtc(start)}`,
      `DTEND:${toIcsUtc(end)}`,
      `SUMMARY:${escapeIcs(a.title)}`,
      `DESCRIPTION:${escapeIcs(
        `${CATEGORY_LABELS[a.category]}${a.description ? ` — ${a.description}` : ""}`
      )}`,
      a.address ? `LOCATION:${escapeIcs(a.address)}` : "",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
