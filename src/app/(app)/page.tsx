"use client";

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
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
  const firstName =
    profile?.displayName &&
    profile.displayName !== profile.email?.split("@")[0]
      ? profile.displayName.split(" ")[0]
      : "Leticia";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-[var(--ink-soft)]">
            {format(nowInSaoPaulo(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--rose-deep)] md:text-5xl">
            Olá, {firstName}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-[var(--ink-soft)]">
            <Sparkles className="h-4 w-4 text-[var(--rose)]" />
            Seu dia organizado com leveza e clareza.
          </p>
        </div>
        <Button asChild>
          <Link href="/compromissos/novo">
            <Plus className="h-4 w-4" />
            Novo compromisso
          </Link>
        </Button>
      </div>

      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        <Card className="hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-base text-[var(--ink-soft)]">
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
              {loading ? "—" : active.length}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-base text-[var(--ink-soft)]">
              Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
              {loading
                ? "—"
                : items.filter((a) => a.status === "concluido").length}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-base text-[var(--ink-soft)]">
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--rose-deep)]">
              {loading
                ? "—"
                : items.filter((a) => a.status === "cancelado").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--rose-deep)]">
          Agenda do dia
        </h2>
        {loading ? (
          <p className="text-sm text-[var(--ink-soft)]">Carregando…</p>
        ) : active.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-[var(--ink-soft)]">
              Nenhum compromisso para hoje. Que tal reservar um momento especial?
            </CardContent>
          </Card>
        ) : (
          <div className="stagger-children space-y-3">
            {active
              .slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
