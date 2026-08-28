import { describe, expect, it } from "vitest";
import { comparisonLabel, formatRecord, formatSigned, valueTone } from "./format";

describe("player intelligence formatting", () => {
  it("makes scoring direction explicit without treating zero as positive or negative", () => {
    expect(formatSigned(-1.24)).toBe("-1.2");
    expect(formatSigned(1.24)).toBe("+1.2");
    expect(formatSigned(0.01)).toBe("0.0");
    expect(formatSigned(null)).toBe("—");
  });

  it("describes lower scoring as better and never relies on color alone", () => {
    expect(comparisonLabel(-0.8)).toBe("0.8 better than league");
    expect(comparisonLabel(0.8)).toBe("0.8 above league");
    expect(comparisonLabel(0)).toBe("Even with league");
    expect(valueTone(-1)).toContain("emerald");
    expect(valueTone(1)).toContain("amber");
  });

  it("shows ties only when a record contains them", () => {
    expect(formatRecord(4, 2, 0)).toBe("4-2");
    expect(formatRecord(4, 2, 1)).toBe("4-2-1");
  });
});
