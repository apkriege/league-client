import { describe, expect, it } from "vitest";
import { getDefaultEventBuilder } from "./eventBuilderDefaults";

describe("event builder defaults", () => {
  it("starts tournaments and mixed-hole leagues with a single event", () => {
    expect(getDefaultEventBuilder("tournament", "18")).toBe("single");
    expect(getDefaultEventBuilder("season", "mixed")).toBe("single");
  });
  it("retains recurring scheduling for fixed-hole seasons", () => {
    expect(getDefaultEventBuilder("season", "9")).toBe("multi");
    expect(getDefaultEventBuilder("season", "18")).toBe("multi");
  });
});
