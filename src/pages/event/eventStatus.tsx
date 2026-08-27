import { Ban, CheckCircle2, CircleDashed, Timer } from "lucide-react";
import type { ReactNode } from "react";

export type EventStatusConfig = {
  label: string;
  icon: ReactNode;
  className: string;
};

const STATUS_CONFIG: Record<string, EventStatusConfig> = {
  scheduled: {
    label: "Scheduled",
    icon: <CircleDashed size={12} strokeWidth={2.5} />,
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  active: {
    label: "In Progress",
    icon: <Timer size={12} strokeWidth={2.5} />,
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  complete: {
    label: "Complete",
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    className: "bg-green-50 text-green-600 border border-green-200",
  },
  canceled: {
    label: "Canceled",
    icon: <Ban size={12} strokeWidth={2.5} />,
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
};

export const normalizeEventStatus = (status: unknown) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "completed" || normalized === "complete") return "complete";
  if (normalized === "canceled" || normalized === "cancelled") return "canceled";
  if (normalized === "upcoming" || normalized === "scheduled") return "scheduled";
  if (normalized === "active") return "active";
  return "scheduled";
};

export const getEventStatusConfig = (status: unknown) =>
  STATUS_CONFIG[normalizeEventStatus(status)] ?? STATUS_CONFIG.scheduled;
