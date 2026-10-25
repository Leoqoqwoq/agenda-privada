import type { Appointment } from "@/lib/types";
import { timesOverlapOnSameDay } from "@/lib/dates";

export function findConflicts(
  candidate: Pick<Appointment, "date" | "startTime" | "endTime" | "id" | "status">,
  existing: Appointment[]
): Appointment[] {
  if (candidate.status === "cancelado") return [];

  return existing.filter((a) => {
    if (a.id === candidate.id) return false;
    if (a.status === "cancelado") return false;
    return timesOverlapOnSameDay(
      candidate.date,
      candidate.startTime,
      candidate.endTime,
      a.date,
      a.startTime,
      a.endTime
    );
  });
}
