import type { Timestamp } from "firebase/firestore";

export const APPOINTMENT_CATEGORIES = [
  "cliente",
  "consulta_medica",
  "exame_medico",
  "compromisso_pessoal",
  "outros",
] as const;

export type AppointmentCategory = (typeof APPOINTMENT_CATEGORIES)[number];

export const APPOINTMENT_STATUSES = [
  "agendado",
  "concluido",
  "cancelado",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const NOTIFICATION_STATUSES = [
  "pending",
  "sent",
  "failed",
  "cancelled",
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface UserPreferences {
  reminderDefaultMinutes: number;
  weekStartsOn: 0 | 1;
  notificationsEnabled: boolean;
  timezone: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp | Date;
  preferences: UserPreferences;
}

export interface Appointment {
  id: string;
  title: string;
  category: AppointmentCategory;
  /** Data no formato YYYY-MM-DD (America/Sao_Paulo) */
  date: string;
  /** Horário HH:mm */
  startTime: string;
  /** Horário HH:mm */
  endTime: string;
  clientId: string | null;
  contactName: string;
  phone: string;
  address: string;
  description: string;
  reminderMinutes: number;
  status: AppointmentStatus;
  recurrence: RecurrenceType;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type AppointmentInput = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt"
>;

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type ClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;

export interface AppNotification {
  id: string;
  appointmentId: string;
  title: string;
  scheduledAt: Timestamp | Date;
  status: NotificationStatus;
  createdAt: Timestamp | Date;
}

export interface CalendarView {
  mode: "day" | "week" | "month";
  anchorDate: Date;
}

export interface AppointmentFilters {
  from?: string;
  to?: string;
  category?: AppointmentCategory | "all";
  status?: AppointmentStatus | "all";
  query?: string;
}
