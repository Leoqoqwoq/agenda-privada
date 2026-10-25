"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/contexts/auth-context";
import { formatDateKey, nowInSaoPaulo } from "@/lib/dates";

export default function DashboardPage() {
  const today = formatDateKey(nowInSaoPaulo());
  const { profile } = useAuth();
  const { items, loading } = useAppointments({ from: today, to: today });
  const active = items.filter((a) => a.status !== "cancelado");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500 capitalize">
            {format(nowInSaoPaulo(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-stone-900 md:text-4xl">
            Olá, {profile?.displayName?.split(" ")[0] || "bem-vinda"}
          </h1>
          <p className="mt-1 text-stone-600">
            Seus compromissos de hoje, organizados com clareza.
          </p>
        </div>
        <Button asChild>
          <Link href="/compromissos/novo">
            <Plus className="h-4 w-4" />
            Novo compromisso
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-stone-500">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-3xl">
              {loading ? "—" : active.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-stone-500">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-3xl">
              {loading
                ? "—"
                : items.filter((a) => a.status === "concluido").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-stone-500">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-3xl">
              {loading
                ? "—"
                : items.filter((a) => a.status === "cancelado").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Agenda do dia
        </h2>
        {loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : active.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-stone-500">
              Nenhum compromisso para hoje. Que tal agendar o próximo?
            </CardContent>
          </Card>
        ) : (
          active
            .slice()
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((a) => <AppointmentCard key={a.id} appointment={a} />)
        )}
      </section>
    </div>
  );
}
