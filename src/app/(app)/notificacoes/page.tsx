"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { listNotifications, saveFcmToken } from "@/lib/firebase/notifications";
import { getClientMessaging, isFirebaseConfigured } from "@/lib/firebase/client";
import type { AppNotification } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getToken } from "firebase/messaging";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        setItems(await listNotifications(user.uid));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function enablePush() {
    if (!user || !isFirebaseConfigured()) return;
    const vapid = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapid) {
      toast.error(
        "Configure NEXT_PUBLIC_FIREBASE_VAPID_KEY para ativar push."
      );
      return;
    }

    setEnabling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada pelo navegador.");
        return;
      }

      // Registra o service worker do Firebase Messaging
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "FIREBASE_CONFIG",
        config: {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        },
      });

      const messaging = await getClientMessaging();
      if (!messaging) {
        toast.error("Este navegador não suporta mensagens push.");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: vapid,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        toast.error("Não foi possível obter o token FCM.");
        return;
      }

      await saveFcmToken(user.uid, token);
      toast.success("Notificações push ativadas neste dispositivo.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Falha ao ativar notificações"
      );
    } finally {
      setEnabling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Lembretes
          </h1>
          <p className="text-stone-600">
            Agendamentos no Firestore e envio via Cloud Messaging / Cloud Functions.
          </p>
        </div>
        <Button onClick={enablePush} disabled={enabling}>
          <Bell className="h-4 w-4" />
          Ativar push neste dispositivo
        </Button>
      </div>

      <Card className="border-rose-200 bg-rose-50/70">
        <CardContent className="flex gap-3 p-4 text-sm text-rose-950">
          <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            O campo <code>reminderMinutes</code> apenas define quando o lembrete
            deve ser enviado. O envio real com o site fechado depende das Cloud
            Functions + FCM (veja o README e a pasta <code>functions/</code>).
            Plano Blaze do Firebase é necessário para Functions agendadas.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            Nenhum lembrete agendado ainda.
          </p>
        ) : (
          items.map((n) => {
            const when =
              n.scheduledAt &&
              typeof n.scheduledAt === "object" &&
              "toDate" in n.scheduledAt
                ? (n.scheduledAt as { toDate: () => Date }).toDate()
                : n.scheduledAt instanceof Date
                  ? n.scheduledAt
                  : null;
            return (
              <Card key={n.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{n.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-stone-600">
                  <p>
                    Agendado para:{" "}
                    {when
                      ? format(when, "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "—"}
                  </p>
                  <p className="mt-1 capitalize">Status: {n.status}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
