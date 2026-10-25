import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import type { AppNotification, Appointment } from "@/lib/types";
import { subtractMinutesFromDateTime } from "@/lib/dates";
import { getClientDb } from "./client";
import { fcmTokensCol, notificationsCol } from "./paths";

function mapNotification(id: string, data: DocumentData): AppNotification {
  return {
    id,
    appointmentId: data.appointmentId,
    title: data.title,
    scheduledAt: data.scheduledAt,
    status: data.status,
    createdAt: data.createdAt,
  };
}

export async function listNotifications(uid: string): Promise<AppNotification[]> {
  const snap = await getDocs(
    query(
      collection(getClientDb(), notificationsCol(uid)),
      orderBy("scheduledAt", "desc")
    )
  );
  return snap.docs.map((d) => mapNotification(d.id, d.data()));
}

export async function scheduleReminderForAppointment(
  uid: string,
  appointment: Appointment
) {
  if (!appointment.reminderMinutes || appointment.reminderMinutes <= 0) return;

  const scheduledAt = Timestamp.fromDate(
    subtractMinutesFromDateTime(
      appointment.date,
      appointment.startTime,
      appointment.reminderMinutes
    )
  );

  const existing = await getDocs(
    query(
      collection(getClientDb(), notificationsCol(uid)),
      where("appointmentId", "==", appointment.id),
      where("status", "==", "pending")
    )
  );
  await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));

  await addDoc(collection(getClientDb(), notificationsCol(uid)), {
    appointmentId: appointment.id,
    title: `Lembrete: ${appointment.title}`,
    scheduledAt,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function cancelRemindersForAppointment(
  uid: string,
  appointmentId: string
) {
  const existing = await getDocs(
    query(
      collection(getClientDb(), notificationsCol(uid)),
      where("appointmentId", "==", appointmentId),
      where("status", "==", "pending")
    )
  );
  await Promise.all(
    existing.docs.map((d) => updateDoc(d.ref, { status: "cancelled" }))
  );
}

export async function saveFcmToken(uid: string, token: string) {
  const ref = doc(getClientDb(), `${fcmTokensCol(uid)}/${token}`);
  await setDoc(
    ref,
    {
      token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    },
    { merge: true }
  );
}
