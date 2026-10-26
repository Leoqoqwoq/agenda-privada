"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      toast.success("E-mail de recuperação enviado");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao enviar recuperação"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--app-bg)] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="ambient-orb absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-[#ffd6e3]/60 blur-3xl" />
        <div className="ambient-orb-delay absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-[#f7c4d6]/50 blur-3xl" />
      </div>
      <Card className="page-enter relative w-full max-w-md border-rose-100/90">
        <CardHeader>
          <CardTitle className="text-3xl text-[var(--rose-deep)]">
            Recuperar senha
          </CardTitle>
          <CardDescription>
            Enviaremos um link de redefinição para o e-mail cadastrado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-sm text-stone-600">
              <p>
                Se o e-mail existir na autenticação, você receberá as instruções em breve.
                Verifique também a caixa de spam.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/login">Voltar ao login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar link
              </Button>
              <p className="text-center text-sm">
                <Link
                  href="/login"
                  className="text-[var(--rose)] transition-colors hover:text-[var(--rose-deep)] hover:underline"
                >
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
