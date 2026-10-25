"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  listAppointments,
  updateAppointment,
} from "@/lib/firebase/appointments";
import {
  cancelRemindersForAppointment,
  scheduleReminderForAppointment,
} from "@/lib/firebase/notifications";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentInput,
} from "@/lib/types";

export function useAppointments(filters: AppointmentFilters = {}) {
  const { user, status } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const reload = useCallback(async () => {
    if (!user || status !== "authenticated") {
      startTransition(() => {
        setItems([]);
        setLoading(false);
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments(user.uid, filters);
      startTransition(() => {
        setItems(data);
        setLoading(false);
      });
    } catch (e) {
      startTransition(() => {
        setError(
          e instanceof Error ? e.message : "Erro ao carregar compromissos"
        );
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    status,
    filters.from,
    filters.to,
    filters.category,
    filters.status,
    filters.query,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user || status !== "authenticated") {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listAppointments(user.uid, {
          from: filters.from,
          to: filters.to,
          category: filters.category,
          status: filters.status,
          query: filters.query,
        });
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Erro ao carregar compromissos"
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    user,
    status,
    filters.from,
    filters.to,
    filters.category,
    filters.status,
    filters.query,
  ]);

  const create = useCallback(
    async (input: AppointmentInput) => {
      if (!user) throw new Error("Não autenticada");
      const id = await createAppointment(user.uid, input);
      await scheduleReminderForAppointment(user.uid, {
        ...input,
        id,
      } as Appointment);
      await reload();
      return id;
    },
    [user, reload]
  );

  const update = useCallback(
    async (id: string, input: Partial<AppointmentInput>) => {
      if (!user) throw new Error("Não autenticada");
      await updateAppointment(user.uid, id, input);
      const full = await getAppointment(user.uid, id);
      if (full) {
        if (full.status === "cancelado" || !full.reminderMinutes) {
          await cancelRemindersForAppointment(user.uid, id);
        } else {
          await scheduleReminderForAppointment(user.uid, full);
        }
      }
      await reload();
    },
    [user, reload]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Não autenticada");
      await cancelRemindersForAppointment(user.uid, id);
      await deleteAppointment(user.uid, id);
      await reload();
    },
    [user, reload]
  );

  return { items, loading, error, reload, create, update, remove };
}

export function useAppointment(id: string | undefined) {
  const { user, status } = useAuth();
  const [item, setItem] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    let cancelled = false;

    if (!user || status !== "authenticated" || !id) {
      queueMicrotask(() => {
        if (!cancelled) {
          setItem(null);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      setLoading(true);
      const data = await getAppointment(user.uid, id);
      if (!cancelled) {
        setItem(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, status, id]);

  return { item, loading, setItem };
}
