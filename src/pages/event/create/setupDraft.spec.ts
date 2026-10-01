import { afterEach, describe, expect, it, vi } from "vitest";
import { clearEventSetupDraft, eventSetupDraftKey, readSetupDraft } from "./setupDraft";

afterEach(() => vi.unstubAllGlobals());
describe("event setup recovery", () => {
  const defaults = { name: "", startTime: "08:30", interval: 10, flights: [] };
  it.each(['broken', 'null', '[]', '{"name":12}', '{"name":"x","startTime":"09:00","interval":"bad","flights":[]}'])("ignores incompatible draft %s", stored => {
    vi.stubGlobal("window", { localStorage: { getItem: () => stored } });
    expect(readSetupDraft("draft", defaults)).toEqual(defaults);
  });
  it("restores schedules and isolates users and leagues", () => {
    const key = eventSetupDraftKey(1, 2);
    const values = new Map([[key, JSON.stringify({ ...defaults, name: "Restored", flights: [[1, 2]] })]]);
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key) } });
    expect(readSetupDraft(key, defaults).name).toBe("Restored");
    expect(readSetupDraft(eventSetupDraftKey(2, 2), defaults)).toEqual(defaults);
    expect(readSetupDraft(eventSetupDraftKey(1, 3), defaults)).toEqual(defaults);
    clearEventSetupDraft(1, 2);
    expect(values.size).toBe(0);
  });
});

it('rejects malformed nested schedules and lineups', async () => {
  const { isSetupSchedule } = await import('./setupDraft');
  expect(isSetupSchedule([null])).toBe(false);
  expect(isSetupSchedule([{ date: '2026-10-01', flights: [[1, 2]], teamLineups: [{ teamId: 1, playerIds: null }] }])).toBe(false);
  expect(isSetupSchedule([{ date: '2026-10-01', flights: [[1, 2]], teamLineups: [] }])).toBe(true);
});
