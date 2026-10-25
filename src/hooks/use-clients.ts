"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
} from "@/lib/firebase/clients";
import type { Client, ClientInput } from "@/lib/types";

export function useClients(search?: string) {
  const { user, status } = useAuth();
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || status !== "authenticated") {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listClients(user.uid, search));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [user, status, search]);

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
        const data = await listClients(user.uid, search);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao carregar clientes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, status, search]);

  const create = useCallback(
    async (input: ClientInput) => {
      if (!user) throw new Error("Não autenticada");
      const id = await createClient(user.uid, input);
      await reload();
      return id;
    },
    [user, reload]
  );

  const update = useCallback(
    async (id: string, input: Partial<ClientInput>) => {
      if (!user) throw new Error("Não autenticada");
      await updateClient(user.uid, id, input);
      await reload();
    },
    [user, reload]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Não autenticada");
      await deleteClient(user.uid, id);
      await reload();
    },
    [user, reload]
  );

  return { items, loading, error, reload, create, update, remove };
}
