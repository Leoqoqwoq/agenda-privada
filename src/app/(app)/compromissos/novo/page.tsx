"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { useClients } from "@/hooks/use-clients";
import { useAuth } from "@/contexts/auth-context";
import type { AppointmentInput } from "@/lib/types";

export default function NewAppointmentPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { items, create } = useAppointments();
  const { items: clients } = useClients();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data: AppointmentInput) {
    setSubmitting(true);
    try {
      const id = await create(data);
      toast.success("Compromisso criado");
      router.push(`/compromissos/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Novo compromisso
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentForm
            clients={clients}
            existing={items}
            defaultReminder={profile?.preferences.reminderDefaultMinutes}
            submitting={submitting}
            onSubmit={onSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
