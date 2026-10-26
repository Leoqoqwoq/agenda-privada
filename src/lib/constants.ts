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
  cliente: "bg-rose-100 text-rose-800 border-rose-200",
  consulta_medica: "bg-pink-100 text-pink-800 border-pink-200",
  exame_medico: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  compromisso_pessoal: "bg-orange-50 text-orange-800 border-orange-200",
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
