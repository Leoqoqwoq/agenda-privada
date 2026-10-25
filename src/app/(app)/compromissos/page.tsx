"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppointments } from "@/hooks/use-appointments";
import {
  APPOINTMENT_CATEGORIES,
  APPOINTMENT_STATUSES,
  type AppointmentCategory,
  type AppointmentStatus,
} from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { appointmentsToCsv, downloadTextFile } from "@/lib/export/csv";
import { appointmentsToIcs } from "@/lib/export/ics";

export default function AppointmentsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState<AppointmentCategory | "all">("all");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [query, setQuery] = useState("");

  const { items, loading } = useAppointments({
    from: from || undefined,
    to: to || undefined,
    category,
    status,
    query,
  });

  function exportCsv() {
    downloadTextFile(appointmentsToCsv(items), "compromissos.csv");
    toast.success("CSV exportado");
  }

  function exportIcs() {
    downloadTextFile(
      appointmentsToIcs(items),
      "compromissos.ics",
      "text/calendar;charset=utf-8"
    );
    toast.success("ICS exportado");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Compromissos
          </h1>
          <p className="text-stone-600">Cadastro, histórico, filtros e exportação.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportIcs}>
            <Download className="h-4 w-4" />
            ICS
          </Button>
          <Button asChild>
            <Link href="/compromissos/novo">
              <Plus className="h-4 w-4" />
              Novo
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white/80 p-4 md:grid-cols-5">
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="De"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label="Até"
        />
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as AppointmentCategory | "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {APPOINTMENT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as AppointmentStatus | "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {APPOINTMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Pesquisar…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            Nenhum compromisso encontrado.
          </p>
        ) : (
          items.map((a) => <AppointmentCard key={a.id} appointment={a} />)
        )}
      </div>
    </div>
  );
}
