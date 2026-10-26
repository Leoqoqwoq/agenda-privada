import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGate } from "@/components/auth/auth-gate";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Agenda da Leticia",
  description:
    "Agenda pessoal e privada da Leticia: clientes, saude e compromissos com carinho.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--ink-soft)]">
                Carregando…
              </div>
            }
          >
            <AuthGate>{children}</AuthGate>
          </Suspense>
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
