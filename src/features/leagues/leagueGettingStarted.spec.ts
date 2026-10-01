import { describe, expect, it } from "vitest";
import { getLeagueGettingStarted } from "./leagueGettingStarted";

describe("league getting started", () => {
  it("starts with scheduling and ignores off/canceled events", () => {
    const result = getLeagueGettingStarted(4, [{ id: 1, type: "off", status: "completed" }, { id: 2, status: "canceled" }], false);
    expect(result.visible).toBe(true);
    expect(result.hasEvent).toBe(false);
    expect(result.nextAction.to).toBe("/league/4/events/create");
  });
  it("guides unfinished flights before scores", () => {
    expect(getLeagueGettingStarted(4, [{ id: 3, flights: [] }], false).nextAction.to).toBe("/league/4/events/3/edit");
    expect(getLeagueGettingStarted(4, [{ id: 3, flights: [{}] }], false).nextAction.to).toBe("/league/4/events/3/scores");
  });
  it("retires onboarding once scoring begins", () => {
    expect(getLeagueGettingStarted(4, [], true).visible).toBe(false);
    expect(getLeagueGettingStarted(4, [{ id: 3, status: "completed" }], false).visible).toBe(false);
  });
});
