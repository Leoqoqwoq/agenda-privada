"use client";

import Link from "next/link";
import { Clock, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppointmentCard({
  appointment,
  compact = false,
}: {
  appointment: Appointment;
  compact?: boolean;
}) {
  return (
    <Link href={`/compromissos/${appointment.id}`}>
      <Card
        className={cn(
          "transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-[0_18px_36px_-22px_rgba(163,68,98,0.55)]",
          appointment.status === "cancelado" && "opacity-60"
        )}
      >
        <CardContent className={cn("space-y-2", compact ? "p-3" : "p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-stone-900">{appointment.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500">
                <Clock className="h-3.5 w-3.5" />
                {appointment.startTime} – {appointment.endTime}
              </p>
            </div>
            <Badge className={CATEGORY_COLORS[appointment.category]}>
              {CATEGORY_LABELS[appointment.category]}
            </Badge>
          </div>

          {!compact && (
            <div className="space-y-1 text-sm text-stone-600">
              {appointment.contactName && (
                <p className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {appointment.contactName}
                </p>
              )}
              {appointment.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {appointment.phone}
                </p>
              )}
              {appointment.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {appointment.address}
                </p>
              )}
              <p className="text-xs text-stone-400">
                {STATUS_LABELS[appointment.status]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
