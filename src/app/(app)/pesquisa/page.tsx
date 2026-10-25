"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { Input } from "@/components/ui/input";
import { useAppointments } from "@/hooks/use-appointments";
import { useClients } from "@/hooks/use-clients";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { items: appointments, loading: loadingA } = useAppointments({ query });
  const { items: clients, loading: loadingC } = useClients(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Pesquisa
        </h1>
        <p className="text-stone-600">
          Busque compromissos e clientes por texto livre.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          className="pl-9"
          placeholder="Digite um nome, telefone, título…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() ? (
        <p className="text-sm text-stone-500">
          Digite algo para pesquisar nos dados do Firestore.
        </p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Compromissos
            </h2>
            {loadingA ? (
              <p className="text-sm text-stone-500">Buscando…</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhum resultado.</p>
            ) : (
              appointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Clientes
            </h2>
            {loadingC ? (
              <p className="text-sm text-stone-500">Buscando…</p>
            ) : clients.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhum resultado.</p>
            ) : (
              clients.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-stone-500">{c.phone}</p>
                    {c.notes && (
                      <p className="mt-1 text-sm text-stone-600">{c.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
