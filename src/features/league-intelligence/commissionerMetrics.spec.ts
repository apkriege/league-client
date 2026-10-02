import { describe, expect, it } from "vitest";
import { buildCommissionerMetrics } from "./commissionerMetrics";
import type { IntelligenceEvent, LeagueAdminInput } from "./types";

const now = new Date("2026-06-01T00:00:00Z");
const entitlement = { status: "trialing", requiredGolfers: 8, paidGolfers: 0, refundedGolfers: 0, trialEventLimit: 3, trialEventCount: 1 };
const league: LeagueAdminInput = {
  endDate: "2026-06-11T00:00:00Z",
  entitlement,
};
const event = (id: number, status: string, startsAt = "2026-06-03T20:00:00Z", type = "regular"): IntelligenceEvent => ({ id, name: `Round ${id}`, status, startsAt, type });

describe("commissioner operational metrics", () => {
  it("uses scored-event trial allowance, separately from the remaining schedule", () => {
    const result = buildCommissionerMetrics(league, [event(1, "upcoming"), event(2, "active")], now);
    expect(result[0]).toMatchObject({ label: "Trial remaining", value: 2, detail: "scored events left" });
    expect(result[1].value).toBe("0 / 2");
    expect(result[3].value).toBe("10 days");
  });
  it("uses the configured limit and never shows negative trial allowance", () => {
    expect(buildCommissionerMetrics({ ...league, entitlement: { ...entitlement, trialEventLimit: 5, trialEventCount: 2 } }, [], now)[0].value).toBe(3);
    expect(buildCommissionerMetrics({ ...league, entitlement: { ...entitlement, trialEventCount: 4 } }, [], now)[0].value).toBe(0);
  });
  it.each([
    ["paid", 8, 0, "Activated"], ["bypassed", 0, 0, "Exempt"], ["pending_payment", 0, 0, "Inactive"], ["paid", 8, 1, "Inactive"],
  ])("shows billing state for %s instead of a misleading trial balance", (status, paidGolfers, refundedGolfers, expected) => {
    expect(buildCommissionerMetrics({ ...league, entitlement: { ...entitlement, status, paidGolfers, refundedGolfers } }, [], now)[0].value).toBe(expected);
  });
  it("counts completed events in the total, excludes off/canceled events, and finds the next event", () => {
    const events = [event(4, "upcoming", "2026-06-10T20:00:00Z"), event(3, "upcoming", "2026-06-02T20:00:00Z"), event(2, "active", "2026-05-30T20:00:00Z"), event(5, "completed"), event(6, "complete"), event(7, "canceled"), event(8, "cancelled"), event(9, "upcoming", undefined, "off")];
    const result = buildCommissionerMetrics(league, events, now);
    expect(result[1].value).toBe("2 / 5");
    expect(result[2]).toMatchObject({ value: "Jun 2", detail: "Round 3" });
    expect(events[0].id).toBe(4);
  });
  it("shows a finished schedule and excludes completed off days", () => {
    const result = buildCommissionerMetrics(league, [event(1, "completed"), event(2, "complete"), event(3, "completed", undefined, "off")], now);
    expect(result[1].value).toBe("2 / 2");
    expect(result[2].value).toBe("—");
  });
  it("formats the next event in its event timezone", () => {
    expect(buildCommissionerMetrics(league, [{ ...event(1, "upcoming", "2026-06-02T01:00:00Z"), timeZone: "America/Indiana/Indianapolis" }], now)[2].value).toBe("Jun 1");
  });
  it("handles missing, expired and archived season data", () => {
    const empty = buildCommissionerMetrics({}, [], now);
    expect(empty.map(metric => metric.value)).toEqual(["Inactive", "0 / 0", "—", "—"]);
    expect(buildCommissionerMetrics({ endDate: "bad" }, [], now)[3].value).toBe("—");
    expect(buildCommissionerMetrics({ endDate: "2026-05-31" }, [], now)[3].value).toBe("Ended");
    expect(buildCommissionerMetrics({ ...league, seasonStatus: "archived" }, [], now)[3].value).toBe("Archived");
  });
});
