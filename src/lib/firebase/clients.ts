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
import type { Client, ClientInput } from "@/lib/types";
import { getClientDb } from "./client";
import { clientDoc, clientsCol } from "./paths";

function mapClient(id: string, data: DocumentData): Client {
  return {
    id,
    name: data.name ?? "",
    phone: data.phone ?? "",
    notes: data.notes ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listClients(uid: string, search?: string): Promise<Client[]> {
  const snap = await getDocs(
    query(collection(getClientDb(), clientsCol(uid)), orderBy("name", "asc"))
  );
  let items = snap.docs.map((d) => mapClient(d.id, d.data()));
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((c) =>
      [c.name, c.phone, c.notes].join(" ").toLowerCase().includes(q)
    );
  }
  return items;
}

export async function getClient(uid: string, id: string): Promise<Client | null> {
  const snap = await getDoc(doc(getClientDb(), clientDoc(uid, id)));
  if (!snap.exists()) return null;
  return mapClient(snap.id, snap.data());
}

export async function createClient(uid: string, input: ClientInput) {
  const ref = await addDoc(collection(getClientDb(), clientsCol(uid)), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateClient(
  uid: string,
  id: string,
  input: Partial<ClientInput>
) {
  await updateDoc(doc(getClientDb(), clientDoc(uid, id)), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClient(uid: string, id: string) {
  await deleteDoc(doc(getClientDb(), clientDoc(uid, id)));
}
