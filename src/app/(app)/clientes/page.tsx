"use client";

import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClients } from "@/hooks/use-clients";
import { useAppointments } from "@/hooks/use-appointments";
import type { Client, ClientInput } from "@/lib/types";
import { clientsToCsv, downloadTextFile } from "@/lib/export/csv";
import { AppointmentCard } from "@/components/appointments/appointment-card";

const emptyClient: ClientInput = { name: "", phone: "", notes: "" };

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { items, loading, create, update, remove } = useClients(search);
  const { items: appointments } = useAppointments();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientInput>(emptyClient);
  const [historyId, setHistoryId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyClient);
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({ name: client.name, phone: client.phone, notes: client.notes });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Informe o nome");
      return;
    }
    try {
      if (editing) {
        await update(editing.id, form);
        toast.success("Cliente atualizado");
      } else {
        await create(form);
        toast.success("Cliente cadastrado");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  async function onDelete(client: Client) {
    if (!confirm(`Excluir ${client.name}?`)) return;
    try {
      await remove(client.id);
      toast.success("Cliente excluído");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const history = historyId
    ? appointments.filter((a) => a.clientId === historyId)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Clientes
          </h1>
          <p className="text-stone-600">Cadastro e histórico de atendimentos.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              downloadTextFile(clientsToCsv(items), "clientes.csv");
              toast.success("CSV exportado");
            }}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        </div>
      </div>

      <Input
        placeholder="Pesquisar por nome, telefone ou observações…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            Nenhum cliente cadastrado.
          </p>
        ) : (
          items.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle>{c.name}</CardTitle>
                  <p className="text-sm text-stone-500">{c.phone || "Sem telefone"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(c)}
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {c.notes && (
                  <p className="text-sm text-stone-600 line-clamp-3">{c.notes}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHistoryId(c.id)}
                  >
                    Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cliente" : "Novo cliente"}
            </DialogTitle>
            <DialogDescription>
              Os dados ficam salvos no Cloud Firestore da sua conta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <Button onClick={save} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyId} onOpenChange={(v) => !v && setHistoryId(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico do cliente</DialogTitle>
            <DialogDescription>
              Compromissos vinculados a este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-stone-500">Sem histórico.</p>
            ) : (
              history.map((a) => (
                <AppointmentCard key={a.id} appointment={a} compact />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
