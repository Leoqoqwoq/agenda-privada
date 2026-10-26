"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { isAuthorizedUid } from "@/lib/constants";
import {
  getClientAuth,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import { ensureUserProfile } from "@/lib/firebase/users";
import type { UserProfile } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "unauthorized" | "misconfigured";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    configured ? "loading" : "misconfigured"
  );

  const loadProfile = useCallback(async (u: User) => {
    const p = await ensureUserProfile(
      u.uid,
      u.email ?? "",
      u.displayName || "Leticia"
    );
    setProfile(p);
  }, []);

  useEffect(() => {
    if (!configured) return;

    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, async (next) => {
      if (!next) {
        setUser(null);
        setProfile(null);
        setStatus("unauthenticated");
        return;
      }

      if (!isAuthorizedUid(next.uid)) {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setStatus("unauthorized");
        return;
      }

      setUser(next);
      try {
        await loadProfile(next);
        setStatus("authenticated");
      } catch {
        setStatus("authenticated");
      }
    });

    return () => unsub();
  }, [configured, loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!isAuthorizedUid(cred.user.uid)) {
      await signOut(auth);
      throw new Error(
        "Esta conta não está autorizada a acessar a agenda."
      );
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(getClientAuth());
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getClientAuth(), email);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user);
  }, [loadProfile, user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      status,
      configured,
      login,
      logout,
      resetPassword,
      refreshProfile,
    }),
    [
      user,
      profile,
      status,
      configured,
      login,
      logout,
      resetPassword,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
