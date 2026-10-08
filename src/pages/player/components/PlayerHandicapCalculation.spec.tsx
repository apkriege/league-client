import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { HandicapCalculation } from "@api/players/types";
import PlayerHandicapCalculation from "./PlayerHandicapCalculation";
const calculation = (): HandicapCalculation => {
  const entries = [4, 6, 8].map((differential, index) => ({ roundIds: [index + 1], differential, playedAt: `2026-01-0${index + 1}T15:00:00Z` }));
  return { policy: "best-rounds-v2", basis: 9, status: "provisional", eligibleRounds: 3,
    bestRounds: 5, historyWindow: 8, holeLimit: "handicap-adjusted", entries, usedEntries: entries, average: 6,
    maximumAdjustment: 0, multiplier: 1, index: 6, storedHandicap: 6, overrides: 0,
    sourceRounds: entries.map((entry, index) => ({ id: index + 1, eventId: index + 1, differential: entry.differential,
      holes: 9, playedAt: entry.playedAt, eventName: `Week ${index + 1}`, gross: 45, net: 36, adjustedGross: 41, rating: 36, slope: 118 })),
  };
};
describe("player handicap calculation display", () => {
  it("shows all early rounds and their average without legacy adjustments", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={calculation()} />);
    expect(html).toContain("(4.00 + 6.00 + 8.00) ÷ 3 × 1.00 = 6.00");
    expect(html).toContain("All 3 rounds count. After 5 rounds");
    expect(html).toContain("Score differential = (adjusted gross − course rating) × (113 ÷ slope).");
    expect(html).toContain("divide an 18-hole differential by 2");
    expect(html).not.toContain("÷ holes played");
    expect(html).not.toContain("Limited-history");
  });
  it("shows the multiplier at the end of the selected-average equation", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={{...calculation(),multiplier:0.96,index:5.76,storedHandicap:5.76}} />);
    expect(html).toContain('÷ 3 × 0.96 = 5.76');
  });
  it("shows recorded gross and net rather than adjusted gross or current handicap", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={calculation()} />);
    expect(html).toContain('>Gross</th>');
    expect(html).toContain('>Net</th>');
    expect(html).toContain('>45</td>');
    expect(html).toContain('>36</td>');
    expect(html).not.toContain('>41</td>');
  });
  it("keeps scratch net scores visible and missing scores unknown", () => {
    const data = calculation();
    data.sourceRounds[0].net = 0;
    data.sourceRounds[1].net = null;
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={data} />);
    expect(html).toContain('>0</td>');
    expect(html).toContain('>—</td>');
  });
  it("explains an unknown handicap without manufacturing zero", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={{ ...calculation(), status: "unknown", index: null, storedHandicap: null, average: null, entries: [], usedEntries: [], eligibleRounds: 0 }} />);
    expect(html).toContain("Not established");
    expect(html).toContain("used to score that event");
    expect(html).not.toContain("0.00");
  });
  it("shows a manual assignment without claiming selected rounds calculate it", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={{ ...calculation(), status: "manual", index: 7, storedHandicap: 7 }} />);
    expect(html).toContain("administrator set");
    expect(html).not.toContain("Your calculation");
    expect(html).toContain("shown for reference");
    expect(html).not.toContain(">Yes</td>");
  });
  it("keeps technical rules expandable and explains the score columns", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={calculation()} />);
    expect(html).toContain('<details>');
    expect(html).not.toContain('<details open');
    expect(html).toContain('Gross is your total strokes. Net is your score after handicap strokes.');
    expect(html).toContain('How round differentials work');
  });
  it("explains when a saved handicap needs updating", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={{...calculation(),storedHandicap:12}} />);
    expect(html).toContain('Your saved handicap needs an update.');
  });
  it("shows the league maximum when the result is capped", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={{...calculation(),index:27,storedHandicap:27,maximumAdjustment:-3}} />);
    expect(html).toContain('League maximum');
    expect(html).toContain('27.00');
  });
  it("shows the configured window after establishment", () => {
    const html = renderToStaticMarkup(<PlayerHandicapCalculation calculation={{ ...calculation(), status: "calculated", eligibleRounds: 12 }} />);
    expect(html).toContain("best 5 of the latest 3 rounds count");
    expect(html).toContain("12 rounds in your handicap history");
  });
});
