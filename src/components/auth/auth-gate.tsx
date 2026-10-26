"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/recuperar-senha"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (status === "loading" || status === "misconfigured") return;

    if (!isPublic && (status === "unauthenticated" || status === "unauthorized")) {
      router.replace("/login");
    }
    if (isPublic && status === "authenticated") {
      router.replace("/");
    }
  }, [status, isPublic, router]);

  if (!configured || status === "misconfigured") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] p-6">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-stone-800">
          <h1 className="font-[family-name:var(--font-display)] text-2xl">
            Firebase não configurado
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Preencha as variáveis <code className="text-xs">NEXT_PUBLIC_FIREBASE_*</code> e{" "}
            <code className="text-xs">NEXT_PUBLIC_AUTHORIZED_UID</code> em{" "}
            <code className="text-xs">.env.local</code>. Veja o README para o passo a passo.
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--rose)]" />
      </div>
    );
  }

  if (!isPublic && status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--rose)]" />
      </div>
    );
  }

  return <>{children}</>;
}
