import { describe, expect, it } from "vitest";
import { getSafeReturnPath } from "./returnPath";

describe("authentication return paths", () => {
  it("retains the invitation token and query", () => {
    expect(getSafeReturnPath("/invite/abc?source=email")).toBe("/invite/abc?source=email");
  });
  it.each([null, undefined, "https://example.com", "//example.com", "/\\example.com", "/\nexample.com"])("rejects unsafe path %s", path => {
    expect(getSafeReturnPath(path)).toBe("/leagues");
  });
});
