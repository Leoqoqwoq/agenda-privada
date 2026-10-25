import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import type {
  Appointment,
  AppointmentFilters,
  AppointmentInput,
} from "@/lib/types";
import { dateKeyInRange } from "@/lib/dates";
import { getClientDb } from "./client";
import { appointmentsCol, appointmentDoc } from "./paths";

function mapAppointment(id: string, data: DocumentData): Appointment {
  return {
    id,
    title: data.title ?? "",
    category: data.category,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    clientId: data.clientId ?? null,
    contactName: data.contactName ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    description: data.description ?? "",
    reminderMinutes: data.reminderMinutes ?? 0,
    status: data.status ?? "agendado",
    recurrence: data.recurrence ?? "none",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listAppointments(
  uid: string,
  filters: AppointmentFilters = {}
): Promise<Appointment[]> {
  const db = getClientDb();
  const snap = await getDocs(
    query(
      collection(db, appointmentsCol(uid)),
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    )
  );

  let items = snap.docs.map((d) => mapAppointment(d.id, d.data()));

  if (filters.from || filters.to) {
    items = items.filter((a) => dateKeyInRange(a.date, filters.from, filters.to));
  }
  if (filters.category && filters.category !== "all") {
    items = items.filter((a) => a.category === filters.category);
  }
  if (filters.status && filters.status !== "all") {
    items = items.filter((a) => a.status === filters.status);
  }
  if (filters.query?.trim()) {
    const qLower = filters.query.trim().toLowerCase();
    items = items.filter((a) =>
      [a.title, a.contactName, a.phone, a.address, a.description]
        .join(" ")
        .toLowerCase()
        .includes(qLower)
    );
  }

  return items;
}

export async function getAppointment(
  uid: string,
  id: string
): Promise<Appointment | null> {
  const snap = await getDoc(doc(getClientDb(), appointmentDoc(uid, id)));
  if (!snap.exists()) return null;
  return mapAppointment(snap.id, snap.data());
}

export async function createAppointment(uid: string, input: AppointmentInput) {
  const ref = await addDoc(collection(getClientDb(), appointmentsCol(uid)), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAppointment(
  uid: string,
  id: string,
  input: Partial<AppointmentInput>
) {
  await updateDoc(doc(getClientDb(), appointmentDoc(uid, id)), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAppointment(uid: string, id: string) {
  await deleteDoc(doc(getClientDb(), appointmentDoc(uid, id)));
}
