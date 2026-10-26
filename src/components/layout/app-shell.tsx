"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  Bell,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Hoje", icon: Home },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/compromissos", label: "Compromissos", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/saude", label: "Saúde", icon: HeartPulse },
  { href: "/pesquisa", label: "Pesquisa", icon: Search },
  { href: "/notificacoes", label: "Lembretes", icon: Bell },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const firstName =
    profile?.displayName &&
    profile.displayName !== profile.email?.split("@")[0]
      ? profile.displayName.split(" ")[0]
      : "Leticia";

  const NavLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }, index) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            style={{ animationDelay: `${index * 40}ms` }}
            className={cn(
              "nav-item-enter group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-300 ease-out",
              active
                ? "bg-[var(--rose)] text-white shadow-[0_10px_24px_-12px_rgba(196,92,122,0.7)] scale-[1.02]"
                : "text-[var(--ink-soft)] hover:bg-white/80 hover:text-[var(--rose-deep)] hover:translate-x-0.5"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-300",
                active ? "scale-110" : "group-hover:scale-110"
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="ambient-orb absolute -left-20 -top-10 h-96 w-96 rounded-full bg-[#ffd6e3]/55 blur-3xl" />
        <div className="ambient-orb-delay absolute -right-16 top-28 h-[28rem] w-[28rem] rounded-full bg-[#f5c6d8]/45 blur-3xl" />
        <div className="petal-drift absolute bottom-8 left-1/3 h-64 w-64 rounded-full bg-[#ffe0ea]/50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(196,92,122,0.12) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/70 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--rose-deep)]">
              Leticia
            </p>
            <p className="text-xs text-[var(--ink-soft)]">Agenda pessoal</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="transition-transform duration-300 active:scale-90"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-rose-100/80 px-3 py-3">
              {NavLinks}
              <Button
                variant="ghost"
                className="mt-2 w-full justify-start text-rose-700"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-[1.75rem] border border-rose-100/90 bg-white/75 p-4 shadow-[0_20px_50px_-28px_rgba(163,68,98,0.45)] backdrop-blur-md lg:flex">
          <div className="mb-6 px-2">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--petal)] px-2.5 py-1 text-xs font-medium text-[var(--rose-deep)]">
              <Sparkles className="h-3.5 w-3.5" />
              Privada
            </div>
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--rose-deep)]">
              Leticia
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Olá, {firstName}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">{NavLinks}</div>
          <Button
            variant="ghost"
            className="mt-4 justify-start text-rose-700 transition-colors hover:bg-rose-50"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </aside>

        <main
          key={pathname}
          className="page-enter min-w-0 flex-1 pb-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
