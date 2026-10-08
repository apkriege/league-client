import type { InsightTone, LeagueIntelligenceMetrics } from "./types";

export type PlayerHighlight = {
  kind: "improvement" | "personal-best" | "recovery" | "consistency";
  label: string;
  title: string;
  detail: string;
  stat: string;
  tone: InsightTone;
  playerId: number;
};

const rounded = (value: number) => Math.round(value * 10) / 10;

export function buildPlayerHighlights(metrics?: LeagueIntelligenceMetrics): PlayerHighlight[] {
  const trends = metrics?.playerWeeklyTrends;
  return (trends?.players ?? []).flatMap<PlayerHighlight>((player) => {
    const scores = player.avgNet.flatMap((score, index) => {
      const holes = trends?.holes?.[index] ?? 18;
      return score != null && Number.isFinite(score) && holes > 0
        ? [rounded(score * 18 / holes)]
        : [];
    });
    if (scores.length < 3) return [];
    const latest = scores[scores.length - 1];
    const previous = scores[scores.length - 2];
    const priorBest = Math.min(...scores.slice(0, -1));
    let streak = 1;
    for (let index = scores.length - 1; index > 0 && scores[index] < scores[index - 1]; index -= 1) {
      streak += 1;
    }
    const base = { title: player.name, playerId: player.playerId, tone: "positive" as const };
    if (streak >= 3) {
      const recent = scores.slice(-streak);
      return [{ ...base, kind: "improvement", label: "Consecutive improvement",
        stat: `${streak} rounds improving`,
        detail: `Net scores fell each round: ${recent.join(" → ")}. That’s ${rounded(recent[0] - latest)} strokes gained across this run of recorded rounds.` }];
    }
    if (latest < priorBest) {
      return [{ ...base, kind: "personal-best", label: "New personal best",
        stat: `${latest} net`,
        detail: `Latest net score beat their previous best of ${priorBest} by ${rounded(priorBest - latest)} strokes, across ${scores.length} recorded rounds in this period.` }];
    }
    const baseline = scores.slice(0, -2);
    const baselineAverage = baseline.reduce((sum, score) => sum + score, 0) / baseline.length;
    if (previous > Math.max(...baseline) && latest <= baselineAverage && previous - latest >= 2) {
      return [{ ...base, kind: "recovery", label: "Bounce-back round",
        stat: `${rounded(previous - latest)} strokes better`,
        detail: `After a ${previous} net round, they returned to ${latest}, at or below their earlier ${rounded(baselineAverage)} average. One recovery round; watch whether it holds.` }];
    }
    const recent = scores.slice(-3);
    const spread = rounded(Math.max(...recent) - Math.min(...recent));
    if (spread <= 2 && latest <= recent[0]) {
      return [{ ...base, tone: "neutral", kind: "consistency", label: "Steady recent scoring",
        stat: `${spread}-stroke range`,
        detail: `Last three net scores: ${recent.join(" / ")}. A narrow range shows repeatable recent results, without implying improvement.` }];
    }
    return [];
  });
}
