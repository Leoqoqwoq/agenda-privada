import type { AppointmentCategory, AppointmentStatus } from "./types";

export const TIMEZONE = "America/Sao_Paulo";

export const CATEGORY_LABELS: Record<AppointmentCategory, string> = {
  cliente: "Cliente",
  consulta_medica: "Consulta médica",
  exame_medico: "Exame médico",
  compromisso_pessoal: "Compromisso pessoal",
  outros: "Outros",
};

export const CATEGORY_COLORS: Record<AppointmentCategory, string> = {
  cliente: "bg-teal-100 text-teal-800 border-teal-200",
  consulta_medica: "bg-sky-100 text-sky-800 border-sky-200",
  exame_medico: "bg-violet-100 text-violet-800 border-violet-200",
  compromisso_pessoal: "bg-amber-100 text-amber-800 border-amber-200",
  outros: "bg-stone-100 text-stone-700 border-stone-200",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const REMINDER_OPTIONS = [
  { value: 0, label: "Sem lembrete" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440, label: "1 dia antes" },
] as const;

export const DEFAULT_PREFERENCES = {
  reminderDefaultMinutes: 30,
  weekStartsOn: 1 as const,
  notificationsEnabled: true,
  timezone: TIMEZONE,
};

export function getAuthorizedUid(): string {
  return process.env.NEXT_PUBLIC_AUTHORIZED_UID?.trim() ?? "";
}

export function isAuthorizedUid(uid: string | null | undefined): boolean {
  const allowed = getAuthorizedUid();
  if (!allowed || !uid) return false;
  return uid === allowed;
}
