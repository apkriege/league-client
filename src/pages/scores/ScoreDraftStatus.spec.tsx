import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ScoreDraftStatus } from "./ScoreDraftStatus";

const props = { hasDraft: true, savedAt: null, onClear: () => {} };
describe("score draft guidance", () => {
  it("distinguishes device drafts from submitted scores", () => {
    const markup = renderToStaticMarkup(<ScoreDraftStatus {...props} />);
    expect(markup).toContain("Draft saved on this device");
    expect(markup).toContain("Submit Scores to save to your league");
    expect(markup).toContain("Clear draft");
  });
  it("shows the matching edit action even when storage fails", () => {
    const markup = renderToStaticMarkup(<ScoreDraftStatus {...props} storageError submitLabel="Save Changes" />);
    expect(markup).toContain("Draft storage is unavailable");
    expect(markup).toContain("Save Changes to save to your league");
    expect(markup).not.toContain("Draft saved on this device");
  });
  it("hides the message when there is no draft", () => {
    expect(renderToStaticMarkup(<ScoreDraftStatus {...props} hasDraft={false} />)).toBe("");
  });
});
