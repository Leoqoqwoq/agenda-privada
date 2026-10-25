"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  updateUserPreferences,
  updateUserProfile,
} from "@/lib/firebase/users";
import { REMINDER_OPTIONS, TIMEZONE } from "@/lib/constants";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftReminder, setDraftReminder] = useState<number | null>(null);
  const [draftNotifications, setDraftNotifications] = useState<boolean | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const displayName = draftName ?? profile?.displayName ?? "";
  const reminder =
    draftReminder ?? profile?.preferences.reminderDefaultMinutes ?? 30;
  const notificationsEnabled =
    draftNotifications ?? profile?.preferences.notificationsEnabled ?? true;

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName: displayName.trim() });
      await updateUserPreferences(user.uid, {
        reminderDefaultMinutes: reminder,
        notificationsEnabled,
        timezone: TIMEZONE,
      });
      await refreshProfile();
      setDraftName(null);
      setDraftReminder(null);
      setDraftNotifications(null);
      toast.success("Configurações salvas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Configurações
        </h1>
        <p className="text-stone-600">Preferências pessoais da agenda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Conta Firebase: {user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome de exibição</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDraftName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Lembrete padrão</Label>
            <Select
              value={String(reminder)}
              onValueChange={(v) => setDraftReminder(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-3">
            <div>
              <p className="text-sm font-medium">Notificações preferidas</p>
              <p className="text-xs text-stone-500">
                Fuso horário fixo: {TIMEZONE}
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setDraftNotifications}
            />
          </div>
          <Button onClick={save} disabled={saving}>
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>
            Não há cadastro público. Somente o UID autorizado em{" "}
            <code className="text-xs">NEXT_PUBLIC_AUTHORIZED_UID</code> e nas
            Firestore Rules pode acessar os dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-stone-600">
          <p>
            UID atual:{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">
              {user?.uid}
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
