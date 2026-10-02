import { getLeagueBillingStatus, TRIAL_EVENT_LIMIT } from "@/lib/billing";
import { formatEventDate, sortEventsByDate } from "@/utils/eventDate";
import type { IntelligenceEvent, LeagueAdminInput } from "./types";

type CommissionerMetric = { label: string; value: string | number; detail: string };

export function buildCommissionerMetrics(
  league: LeagueAdminInput,
  events: IntelligenceEvent[],
  now = new Date(),
): CommissionerMetric[] {
  const billingStatus = getLeagueBillingStatus(league);
  const trialLimit = league.entitlement?.trialEventLimit ?? TRIAL_EVENT_LIMIT;
  const trialUsed = league.entitlement?.trialEventCount ?? 0;
  const remaining = events.filter(event =>
    String(event.type ?? "").toLowerCase() !== "off" &&
    ["upcoming", "active"].includes(String(event.status ?? "").toLowerCase()),
  );
  const nextEvent = sortEventsByDate(remaining.filter(event =>
    new Date(event.startsAt).getTime() >= now.getTime(),
  ))[0];
  const endTime = league.endDate ? new Date(league.endDate).getTime() : NaN;
  const daysRemaining = Number.isFinite(endTime)
    ? Math.max(0, Math.ceil((endTime - now.getTime()) / 86_400_000)) : null;
  const archived = league.seasonStatus === "archived";

  return [
    {
      label: "Trial remaining",
      value: billingStatus === "trial" ? Math.max(0, trialLimit - trialUsed)
        : billingStatus === "active" ? "Activated" : billingStatus === "exempt" ? "Exempt" : "Inactive",
      detail: billingStatus === "trial" ? "scored events left"
        : billingStatus === "active" ? "Paid season" : billingStatus === "exempt" ? "No trial limit" : "Activation required",
    },
    { label: "Events remaining", value: remaining.length, detail: "upcoming or in progress" },
    {
      label: "Next event",
      value: nextEvent ? formatEventDate(nextEvent.startsAt, { month: "short", day: "numeric" }, "en-US", nextEvent.timeZone) : "—",
      detail: nextEvent?.name ?? "No upcoming event",
    },
    {
      label: "Season remaining",
      value: archived ? "Archived" : daysRemaining == null ? "—" : endTime < now.getTime() ? "Ended" : `${daysRemaining} days`,
      detail: archived ? "Season is archived" : daysRemaining == null ? "No end date" : endTime < now.getTime() ? "Season has ended" : "until season end",
    },
  ];
}
