import { describe, expect, it } from "vitest";
import { readScoreDraft } from "./scoreDraftStorage";

const baseline = { teams: [{ teamId: 1, scores: ["", ""] }] };
const values = { teams: [{ teamId: 1, scores: [4, 5] }] };
const stored = (overrides = {}) => ({
  getItem: () => JSON.stringify({ version: 2, scope: "roster-a", savedAt: "2026-09-01", values, ...overrides }),
});

describe("score draft validation", () => {
  it("restores a current, complete draft", () => {
    expect(readScoreDraft(stored(), "key", "roster-a", baseline)?.values).toEqual(values);
  });
  it("rejects a draft from changed assignments or format", () => {
    expect(readScoreDraft(stored(), "key", "roster-b", baseline)).toBeNull();
  });
  it("rejects malformed score arrays and legacy drafts", () => {
    expect(readScoreDraft(stored({ values: { teams: [{ teamId: 1, scores: [4] }] } }), "key", "roster-a", baseline)).toBeNull();
    expect(readScoreDraft(stored({ version: 1 }), "key", "roster-a", baseline)).toBeNull();
    expect(readScoreDraft(stored({ values: { teams: [{ teamId: 1, scores: ["invalid", 5] }] } }), "key", "roster-a", baseline)).toBeNull();
  });
});
