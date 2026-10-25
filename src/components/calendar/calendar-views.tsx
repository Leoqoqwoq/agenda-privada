"use client";

import { useMemo } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDateKey } from "@/lib/dates";

type Mode = "day" | "week" | "month";

export function CalendarViews({
  mode,
  onModeChange,
  anchor,
  onAnchorChange,
  appointments,
}: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  anchor: Date;
  onAnchorChange: (d: Date) => void;
  appointments: Appointment[];
}) {
  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    return map;
  }, [appointments]);

  function shift(dir: -1 | 1) {
    if (mode === "day") onAnchorChange(addDays(anchor, dir));
    else if (mode === "week") onAnchorChange(addDays(anchor, dir * 7));
    else onAnchorChange(dir === 1 ? addMonths(anchor, 1) : subMonths(anchor, 1));
  }

  const title =
    mode === "month"
      ? format(anchor, "MMMM yyyy", { locale: ptBR })
      : mode === "week"
        ? `Semana de ${format(startOfWeek(anchor, { weekStartsOn: 1 }), "dd/MM", { locale: ptBR })}`
        : format(anchor, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[12rem] font-[family-name:var(--font-display)] text-xl capitalize text-stone-900">
            {title}
          </h2>
          <Button variant="outline" size="icon" onClick={() => shift(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onAnchorChange(new Date())}>
            Hoje
          </Button>
        </div>
        <div className="flex rounded-xl border border-stone-200 bg-white p-1">
          {(["day", "week", "month"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm capitalize",
                mode === m ? "bg-teal-700 text-white" : "text-stone-600 hover:bg-stone-50"
              )}
            >
              {m === "day" ? "Dia" : m === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {mode === "day" && (
        <DayView date={anchor} items={byDate.get(formatDateKey(anchor)) ?? []} />
      )}
      {mode === "week" && <WeekView anchor={anchor} byDate={byDate} onSelectDay={onAnchorChange} />}
      {mode === "month" && (
        <MonthView
          anchor={anchor}
          byDate={byDate}
          onSelectDay={(d) => {
            onAnchorChange(d);
            onModeChange("day");
          }}
        />
      )}
    </div>
  );
}

function DayView({ date, items }: { date: Date; items: Appointment[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500 capitalize">
        {format(date, "EEEE, d 'de' MMMM yyyy", { locale: ptBR })}
      </p>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-8 text-center text-stone-500">
          Nenhum compromisso neste dia.
        </p>
      ) : (
        items
          .slice()
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((a) => <AppointmentCard key={a.id} appointment={a} />)
      )}
    </div>
  );
}

function WeekView({
  anchor,
  byDate,
  onSelectDay,
}: {
  anchor: Date;
  byDate: Map<string, Appointment[]>;
  onSelectDay: (d: Date) => void;
}) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end: endOfWeek(anchor, { weekStartsOn: 1 }) });

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const key = formatDateKey(day);
        const items = byDate.get(key) ?? [];
        return (
          <button
            key={key}
            onClick={() => onSelectDay(day)}
            className={cn(
              "min-h-36 rounded-2xl border border-stone-200 bg-white/80 p-3 text-left transition hover:border-teal-300",
              isSameDay(day, new Date()) && "ring-2 ring-teal-600/30"
            )}
          >
            <p className="text-xs font-medium uppercase text-stone-400">
              {format(day, "EEE", { locale: ptBR })}
            </p>
            <p className="font-[family-name:var(--font-display)] text-lg">{format(day, "d")}</p>
            <div className="mt-2 space-y-1">
              {items.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "truncate rounded-md border px-1.5 py-0.5 text-[10px]",
                    CATEGORY_COLORS[a.category]
                  )}
                  title={a.title}
                >
                  {a.startTime} {a.title}
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-[10px] text-stone-400">+{items.length - 3}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MonthView({
  anchor,
  byDate,
  onSelectDay,
}: {
  anchor: Date;
  byDate: Map<string, Appointment[]>;
  onSelectDay: (d: Date) => void;
}) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-stone-400">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = formatDateKey(day);
          const items = byDate.get(key) ?? [];
          const inMonth = isSameMonth(day, anchor);
          return (
            <button
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                "min-h-20 rounded-xl border border-stone-200 bg-white/70 p-2 text-left transition hover:border-teal-300",
                !inMonth && "opacity-40",
                isSameDay(day, new Date()) && "ring-2 ring-teal-600/30"
              )}
            >
              <p className="text-sm font-medium">{format(day, "d")}</p>
              <div className="mt-1 flex flex-wrap gap-0.5">
                {items.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className={cn("h-1.5 w-1.5 rounded-full", CATEGORY_COLORS[a.category].split(" ")[0])}
                    title={`${CATEGORY_LABELS[a.category]}: ${a.title}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
