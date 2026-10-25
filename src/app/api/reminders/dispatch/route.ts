import { NextRequest, NextResponse } from "next/server";
import {
  assertAuthorizedUser,
  getAdminDb,
  getAdminMessaging,
} from "@/lib/firebase/admin";

/**
 * Dispara lembretes pendentes cujo scheduledAt já passou.
 * Protegido por Bearer token do usuário autorizado (Firebase ID token).
 *
 * Em produção, prefira a Cloud Function agendada em functions/,
 * que não depende do site aberto.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = await assertAuthorizedUser(authHeader.slice(7));
    const uid = decoded.uid;
    const db = getAdminDb();
    const messaging = getAdminMessaging();

    const now = new Date();
    const snap = await db
      .collection(`users/${uid}/notifications`)
      .where("status", "==", "pending")
      .where("scheduledAt", "<=", now)
      .get();

    const tokensSnap = await db.collection(`users/${uid}/fcmTokens`).get();
    const tokens = tokensSnap.docs.map((d) => d.data().token as string).filter(Boolean);

    let sent = 0;
    for (const doc of snap.docs) {
      const data = doc.data();
      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: data.title || "Lembrete",
            body: "Você tem um compromisso próximo.",
          },
          data: {
            appointmentId: String(data.appointmentId || ""),
          },
        });
      }
      await doc.ref.update({ status: "sent" });
      sent += 1;
    }

    return NextResponse.json({ ok: true, sent, tokens: tokens.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro interno";
    const status = message.includes("autorizado") || message.includes("AUTHORIZED")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
