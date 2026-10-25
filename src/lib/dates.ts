import {
  addDays,
  addMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TIMEZONE } from "./constants";

export function nowInSaoPaulo(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function formatDateKey(date: Date): string {
  return format(toZonedTime(date, TIMEZONE), "yyyy-MM-dd");
}

export function formatDisplayDate(dateKey: string): string {
  const date = parseISO(dateKey);
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDisplayDateLong(dateKey: string): string {
  const date = parseISO(dateKey);
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function combineDateAndTime(dateKey: string, time: string): Date {
  const parsed = parse(
    `${dateKey} ${time.slice(0, 5)}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  return fromZonedTime(parsed, TIMEZONE);
}

export function subtractMinutesFromDateTime(
  dateKey: string,
  time: string,
  minutes: number
): Date {
  return addMinutes(combineDateAndTime(dateKey, time), -minutes);
}

export function getWeekRange(anchor: Date, weekStartsOn: 0 | 1 = 1) {
  const zoned = toZonedTime(anchor, TIMEZONE);
  const start = startOfWeek(zoned, { weekStartsOn });
  const end = endOfWeek(zoned, { weekStartsOn });
  return { start, end };
}

export function getMonthRange(anchor: Date) {
  const zoned = toZonedTime(anchor, TIMEZONE);
  return {
    start: startOfMonth(zoned),
    end: endOfMonth(zoned),
  };
}

export function getDayRange(anchor: Date) {
  const zoned = toZonedTime(anchor, TIMEZONE);
  const start = startOfDay(zoned);
  return { start, end: addDays(start, 1) };
}

export function isTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

export function timesOverlapOnSameDay(
  dateA: string,
  startA: string,
  endA: string,
  dateB: string,
  startB: string,
  endB: string
): boolean {
  if (dateA !== dateB) return false;
  return isTimeOverlap(startA, endA, startB, endB);
}

export function dateKeyInRange(
  dateKey: string,
  from?: string,
  to?: string
): boolean {
  if (!from && !to) return true;
  const d = parseISO(dateKey);
  if (from && to) {
    return isWithinInterval(d, { start: parseISO(from), end: parseISO(to) });
  }
  if (from) return d >= parseISO(from);
  if (to) return d <= parseISO(to);
  return true;
}

export function listDaysBetween(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  let current = startOfDay(from);
  const last = startOfDay(to);
  while (current <= last) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}
