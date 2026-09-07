import { describe, expect, it } from "vitest";
import { getEventRouteLabel, getEventRouteTeeLabel } from "./eventRoute";

describe("event route labels", () => {
  it("shows ordered named nines and collapses a shared tee label", () => {
    const event = {
      routeSegments: [
        { position: 1, course: { name: "South" }, tee: { name: "Blue" } },
        { position: 0, course: { name: "North" }, tee: { name: "Blue" } },
      ],
    };

    expect(getEventRouteLabel(event)).toBe("North → South");
    expect(getEventRouteTeeLabel(event)).toBe("Blue");
  });

  it("shows tee changes across route segments", () => {
    expect(getEventRouteTeeLabel({
      routeSegments: [
        { position: 0, tee: { name: "Blue" } },
        { position: 1, tee: { name: "White" } },
      ],
    })).toBe("Blue → White");
  });

  it("keeps labels aligned with the immutable scoring snapshot", () => {
    const event = {
      routeSnapshot: {
        version: 1,
        segments: [{ position: 0, course: { name: "Original Nine" }, tee: { name: "Blue" } }],
      },
      routeSegments: [
        { position: 0, course: { name: "Renamed Nine" }, tee: { name: "Gold" } },
      ],
    };

    expect(getEventRouteLabel(event)).toBe("Original Nine");
    expect(getEventRouteTeeLabel(event)).toBe("Blue");
  });
});
