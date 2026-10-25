"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPOINTMENT_CATEGORIES,
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentInput,
  type Client,
} from "@/lib/types";
import {
  CATEGORY_LABELS,
  REMINDER_OPTIONS,
  STATUS_LABELS,
} from "@/lib/constants";
import { findConflicts } from "@/lib/conflicts";
import { formatDateKey, nowInSaoPaulo } from "@/lib/dates";

const empty: AppointmentInput = {
  title: "",
  category: "cliente",
  date: formatDateKey(nowInSaoPaulo()),
  startTime: "09:00",
  endTime: "10:00",
  clientId: null,
  contactName: "",
  phone: "",
  address: "",
  description: "",
  reminderMinutes: 30,
  status: "agendado",
  recurrence: "none",
};

export function AppointmentForm({
  initial,
  clients,
  existing,
  defaultReminder,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: Appointment;
  clients: Client[];
  existing: Appointment[];
  defaultReminder?: number;
  submitting?: boolean;
  onSubmit: (data: AppointmentInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<AppointmentInput>(() =>
    initial
      ? {
          title: initial.title,
          category: initial.category,
          date: initial.date,
          startTime: initial.startTime,
          endTime: initial.endTime,
          clientId: initial.clientId,
          contactName: initial.contactName,
          phone: initial.phone,
          address: initial.address,
          description: initial.description,
          reminderMinutes: initial.reminderMinutes,
          status: initial.status,
          recurrence: initial.recurrence,
        }
      : { ...empty, reminderMinutes: defaultReminder ?? 30 }
  );
  const [error, setError] = useState("");

  const conflicts = useMemo(
    () =>
      findConflicts(
        {
          id: initial?.id ?? "",
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          status: form.status,
        },
        existing
      ),
    [form, existing, initial?.id]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Informe um título.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setError("O horário de término deve ser após o início.");
      return;
    }
    await onSubmit({
      ...form,
      title: form.title.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
    });
  }

  function set<K extends keyof AppointmentInput>(
    key: K,
    value: AppointmentInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onClientChange(clientId: string | null) {
    const client = clientId
      ? clients.find((c) => c.id === clientId)
      : undefined;
    setForm((prev) => ({
      ...prev,
      clientId,
      contactName: client
        ? prev.contactName || client.name
        : prev.contactName,
      phone: client ? prev.phone || client.phone : prev.phone,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex.: Atendimento Maria"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={form.category}
            onValueChange={(v) =>
              set("category", v as AppointmentInput["category"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPOINTMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              set("status", v as AppointmentInput["status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPOINTMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="start">Início</Label>
            <Input
              id="start"
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Fim</Label>
            <Input
              id="end"
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cliente (opcional)</Label>
          <Select
            value={form.clientId ?? "none"}
            onValueChange={(v) => onClientChange(v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Lembrete</Label>
          <Select
            value={String(form.reminderMinutes)}
            onValueChange={(v) => set("reminderMinutes", Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Nome do contato</Label>
          <Input
            id="contact"
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Conflito de horário detectado</p>
            <ul className="mt-1 list-disc pl-4">
              {conflicts.map((c) => (
                <li key={c.id}>
                  {c.title} ({c.startTime}–{c.endTime})
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs">
              Você ainda pode salvar, mas revise a agenda.
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
