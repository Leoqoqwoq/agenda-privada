import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";

initializeApp();

/**
 * Processa lembretes pendentes a cada minuto.
 *
 * Requisitos:
 * - Plano Blaze (pay-as-you-go) no Firebase
 * - Cloud Messaging ativado
 * - AUTHORIZED_UID definido nas variáveis de ambiente da Function:
 *     firebase functions:secrets:set AUTHORIZED_UID
 *   ou config via .env da functions
 *
 * O Admin SDK ignora as Firestore Rules — por isso filtramos
 * explicitamente pelo UID autorizado.
 */
export const dispatchReminders = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "America/Sao_Paulo",
    region: "southamerica-east1",
  },
  async () => {
    const authorizedUid = process.env.AUTHORIZED_UID?.trim();
    if (!authorizedUid) {
      logger.error("AUTHORIZED_UID não configurado na Function");
      return;
    }

    const db = getFirestore();
    const messaging = getMessaging();
    const now = Timestamp.now();

    const pending = await db
      .collection(`users/${authorizedUid}/notifications`)
      .where("status", "==", "pending")
      .where("scheduledAt", "<=", now)
      .limit(50)
      .get();

    if (pending.empty) {
      logger.info("Nenhum lembrete pendente");
      return;
    }

    const tokensSnap = await db
      .collection(`users/${authorizedUid}/fcmTokens`)
      .get();
    const tokens = tokensSnap.docs
      .map((d) => d.data().token as string)
      .filter(Boolean);

    for (const doc of pending.docs) {
      const data = doc.data();
      try {
        if (tokens.length > 0) {
          const response = await messaging.sendEachForMulticast({
            tokens,
            notification: {
              title: data.title || "Lembrete da Agenda",
              body: "Você tem um compromisso próximo.",
            },
            data: {
              appointmentId: String(data.appointmentId || ""),
            },
          });
          logger.info("Push enviado", {
            success: response.successCount,
            failure: response.failureCount,
          });
        } else {
          logger.warn("Sem tokens FCM registrados para o UID autorizado");
        }
        await doc.ref.update({ status: "sent" });
      } catch (err) {
        logger.error("Falha ao enviar lembrete", err);
        await doc.ref.update({ status: "failed" });
      }
    }
  }
);
