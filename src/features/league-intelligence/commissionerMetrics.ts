import { getLeagueBillingStatus, TRIAL_EVENT_LIMIT } from "@/lib/billing";
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
  const scheduled = events.filter(event =>
    String(event.type ?? "").toLowerCase() !== "off" &&
    !["canceled", "cancelled"].includes(String(event.status ?? "").toLowerCase()),
  );
  const completed = scheduled.filter(event =>
    ["complete", "completed"].includes(String(event.status ?? "").toLowerCase()),
  ).length;
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
    { label: "Events completed", value: `${completed} / ${scheduled.length}`, detail: "completed / total" },
    {
      label: "Total players",
      value: league.players?.length ?? 0,
      detail: "players and substitutes",
    },
    {
      label: "Season remaining",
      value: archived ? "Archived" : daysRemaining == null ? "—" : endTime < now.getTime() ? "Ended" : `${daysRemaining} days`,
      detail: archived ? "Season is archived" : daysRemaining == null ? "No end date" : endTime < now.getTime() ? "Season has ended" : "until season end",
    },
  ];
}
