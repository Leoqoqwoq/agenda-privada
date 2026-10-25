import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin não configurado. Defina FIREBASE_ADMIN_* no ambiente do servidor."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminMessaging() {
  return getMessaging(getAdminApp());
}

/** Valida o ID token e garante que o UID é o da proprietária. */
export async function assertAuthorizedUser(idToken: string) {
  const authorizedUid = process.env.AUTHORIZED_UID?.trim();
  if (!authorizedUid) {
    throw new Error("AUTHORIZED_UID não configurado no servidor.");
  }

  const decoded = await getAdminAuth().verifyIdToken(idToken);
  if (decoded.uid !== authorizedUid) {
    throw new Error("Usuário não autorizado.");
  }

  return decoded;
}
