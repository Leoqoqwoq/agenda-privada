"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointment, useAppointments } from "@/hooks/use-appointments";
import { useClients } from "@/hooks/use-clients";
import type { AppointmentInput } from "@/lib/types";

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { item, loading } = useAppointment(id);
  const { items, update, remove } = useAppointments();
  const { items: clients } = useClients();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data: AppointmentInput) {
    setSubmitting(true);
    try {
      await update(id, data);
      toast.success("Compromisso atualizado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!confirm("Excluir este compromisso permanentemente?")) return;
    try {
      await remove(id);
      toast.success("Compromisso excluído");
      router.push("/compromissos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  if (loading) {
    return <p className="text-stone-500">Carregando…</p>;
  }

  if (!item) {
    return <p className="text-stone-500">Compromisso não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Editar compromisso
        </h1>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            initial={item}
            clients={clients}
            existing={items}
            submitting={submitting}
            onSubmit={onSubmit}
            onCancel={() => router.push("/compromissos")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
