import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";

afterEach(() => vi.unstubAllGlobals());
describe("clipboard copy", () => {
  it("waits for the browser to confirm writing", async () => {
    let complete: () => void = () => {};
    const writeText = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    let finished = false;
    const pending = copyText("LEAGUE").then(() => { finished = true; });
    expect(writeText).toHaveBeenCalledWith("LEAGUE");
    expect(finished).toBe(false);
    complete();
    await pending;
    expect(finished).toBe(true);
  });
  it("rejects unavailable clipboard support", async () => {
    vi.stubGlobal("navigator", {});
    await expect(copyText("LEAGUE")).rejects.toThrow("Clipboard is unavailable");
  });
  it("propagates clipboard permission failure", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } });
    await expect(copyText("LEAGUE")).rejects.toThrow("Denied");
  });
});
