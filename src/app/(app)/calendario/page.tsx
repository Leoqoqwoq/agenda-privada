"use client";

import { useMemo, useState } from "react";
import { addDays, endOfMonth, startOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { CalendarViews } from "@/components/calendar/calendar-views";
import { useAppointments } from "@/hooks/use-appointments";
import { formatDateKey } from "@/lib/dates";

export default function CalendarPage() {
  const [mode, setMode] = useState<"day" | "week" | "month">("month");
  const [anchor, setAnchor] = useState(new Date());

  const range = useMemo(() => {
    if (mode === "day") {
      const key = formatDateKey(anchor);
      return { from: key, to: key };
    }
    if (mode === "week") {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      const end = endOfWeek(anchor, { weekStartsOn: 1 });
      return { from: formatDateKey(start), to: formatDateKey(end) };
    }
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    return {
      from: formatDateKey(addDays(start, 0)),
      to: formatDateKey(end),
    };
  }, [mode, anchor]);

  const { items, loading } = useAppointments(range);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Calendário
        </h1>
        <p className="text-stone-600">
          Visualize o dia, a semana ou o mês inteiro.
        </p>
      </div>
      {loading && (
        <p className="text-sm text-stone-500">Atualizando compromissos…</p>
      )}
      <CalendarViews
        mode={mode}
        onModeChange={setMode}
        anchor={anchor}
        onAnchorChange={setAnchor}
        appointments={items}
      />
    </div>
  );
}
