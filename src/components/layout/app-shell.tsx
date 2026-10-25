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

  const NavLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-teal-700 text-white shadow-sm"
                : "text-stone-600 hover:bg-white/70 hover:text-stone-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-stone-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/75 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
              Agenda
            </p>
            <p className="text-xs text-stone-500">{profile?.displayName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {open && (
          <div className="border-t border-stone-200/70 px-3 py-3">
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
        )}
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-3xl border border-stone-200/80 bg-white/80 p-4 shadow-sm backdrop-blur lg:flex">
          <div className="mb-6 px-2">
            <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-stone-900">
              Agenda
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {profile?.displayName || "Privada"}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">{NavLinks}</div>
          <Button
            variant="ghost"
            className="mt-4 justify-start text-rose-700"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </aside>

        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
