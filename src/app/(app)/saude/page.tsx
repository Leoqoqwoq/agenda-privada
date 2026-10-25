"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/hooks/use-appointments";

export default function HealthPage() {
  const { items, loading } = useAppointments({
    category: "consulta_medica",
  });
  const exames = useAppointments({ category: "exame_medico" });

  const consultas = items
    .slice()
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  const examesList = exames.items
    .slice()
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Saúde
          </h1>
          <p className="text-stone-600">
            Consultas médicas e exames em um só lugar.
          </p>
        </div>
        <Button asChild>
          <Link href="/compromissos/novo">
            <Plus className="h-4 w-4" />
            Agendar
          </Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Consultas médicas
        </h2>
        {loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : consultas.length === 0 ? (
          <p className="text-sm text-stone-500">Nenhuma consulta cadastrada.</p>
        ) : (
          consultas.map((a) => <AppointmentCard key={a.id} appointment={a} />)
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Exames médicos
        </h2>
        {exames.loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : examesList.length === 0 ? (
          <p className="text-sm text-stone-500">Nenhum exame cadastrado.</p>
        ) : (
          examesList.map((a) => <AppointmentCard key={a.id} appointment={a} />)
        )}
      </section>
    </div>
  );
}
