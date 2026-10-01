import { afterEach, describe, expect, it, vi } from "vitest";
import { readBrowserStorage, removeBrowserStorage, writeBrowserStorage } from "./browserStorage";

afterEach(() => vi.unstubAllGlobals());
describe("browser draft storage", () => {
  it("does not crash when storage is unavailable", () => {
    vi.stubGlobal("window", { get localStorage() { throw new Error("blocked"); } });
    expect(readBrowserStorage("draft")).toBeNull();
    expect(writeBrowserStorage("draft", "values")).toBe(false);
    expect(removeBrowserStorage("draft")).toBe(false);
  });
  it("round trips and explicitly removes a draft", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } });
    expect(writeBrowserStorage("draft:1", "saved")).toBe(true);
    expect(readBrowserStorage("draft:1")).toBe("saved");
    expect(readBrowserStorage("draft:2")).toBeNull();
    expect(removeBrowserStorage("draft:1")).toBe(true);
    expect(readBrowserStorage("draft:1")).toBeNull();
  });
});
