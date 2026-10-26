"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { login, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Bem-vinda, Leticia");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--app-bg)] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="ambient-orb absolute left-[-12%] top-[-8%] h-[22rem] w-[22rem] rounded-full bg-[#ffd6e3]/70 blur-3xl" />
        <div className="ambient-orb-delay absolute bottom-[-12%] right-[-8%] h-[26rem] w-[26rem] rounded-full bg-[#f7c4d6]/55 blur-3xl" />
        <div className="petal-drift absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-[#ffe8ef]/60 blur-3xl" />
      </div>

      <Card className="page-enter relative w-full max-w-md border-rose-100/90 shadow-[0_30px_60px_-28px_rgba(163,68,98,0.45)] transition-transform duration-500 hover:-translate-y-1">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--rose)] text-white shadow-[0_12px_24px_-10px_rgba(196,92,122,0.8)] transition-transform duration-500 hover:scale-105">
            <Heart className="h-6 w-6 fill-white/30" />
          </div>
          <CardTitle className="text-4xl text-[var(--rose-deep)]">
            Leticia
          </CardTitle>
          <CardDescription className="text-base">
            Sua agenda privada — só para você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {status === "unauthorized" && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                Conta não autorizada para esta agenda.
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
            <Link
              href="/recuperar-senha"
              className="text-[var(--rose)] transition-colors hover:text-[var(--rose-deep)] hover:underline"
            >
              Esqueci minha senha
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
