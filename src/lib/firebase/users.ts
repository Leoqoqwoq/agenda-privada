import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import type { UserPreferences, UserProfile } from "@/lib/types";
import { getClientDb } from "./client";
import { userDoc } from "./paths";

export async function ensureUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<UserProfile> {
  const ref = doc(getClientDb(), userDoc(uid));
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid,
      displayName: data.displayName ?? displayName,
      email: data.email ?? email,
      createdAt: data.createdAt,
      preferences: { ...DEFAULT_PREFERENCES, ...data.preferences },
    };
  }

  const profile = {
    displayName,
    email,
    createdAt: serverTimestamp(),
    preferences: DEFAULT_PREFERENCES,
  };
  await setDoc(ref, profile);

  return {
    uid,
    displayName,
    email,
    createdAt: new Date(),
    preferences: DEFAULT_PREFERENCES,
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getClientDb(), userDoc(uid)));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    displayName: data.displayName ?? "",
    email: data.email ?? "",
    createdAt: data.createdAt,
    preferences: { ...DEFAULT_PREFERENCES, ...data.preferences },
  };
}

export async function updateUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>
) {
  const ref = doc(getClientDb(), userDoc(uid));
  const snap = await getDoc(ref);
  const current = snap.exists()
    ? { ...DEFAULT_PREFERENCES, ...snap.data().preferences }
    : DEFAULT_PREFERENCES;

  await updateDoc(ref, {
    preferences: { ...current, ...preferences },
  });
}

export async function updateUserProfile(
  uid: string,
  data: { displayName?: string }
) {
  await updateDoc(doc(getClientDb(), userDoc(uid)), data);
}
