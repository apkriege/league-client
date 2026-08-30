import {
  deriveScoringMode,
  getScoringFamily,
  getScoringModeLabel,
  type ScoringConfiguration,
} from "./scoringModes";

export type EventScoringInput = {
  format?: unknown;
  scoringMode?: unknown;
  scoringConfig?: ScoringConfiguration | null;
  pointsEnabled?: boolean;
  ptsPerHole?: unknown;
  ptsPerMatch?: unknown;
  ptsPerTeamWin?: unknown;
  strokePoints?: unknown;
};

const formatPoints = (value: unknown) => {
  const points = Number(value || 0);
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
};

const parsePlacementPoints = (value: unknown): number[] => {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return values
    .map(Number)
    .filter((point) => Number.isFinite(point) && point >= 0);
};

const getStablefordLabel = (configuration?: ScoringConfiguration | null) => {
  const scale = configuration?.stablefordPointScale;
  if (!scale) return "Stableford hole points";
  return `Stableford · Eagle ${formatPoints(scale.eagle)} · Birdie ${formatPoints(scale.birdie)} · Par ${formatPoints(scale.par)} · Bogey ${formatPoints(scale.bogey)}`;
};

export function getEventScoringSummary(event: EventScoringInput) {
  const mode = deriveScoringMode(event);
  const model = String(event.format || "individual").toLowerCase() === "team"
    ? "Team"
    : "Individual";

  if (event.pointsEnabled === false) {
    return {
      format: `${model} · ${getScoringModeLabel(event)}`,
      points: "Season points disabled",
    };
  }

  if (mode === "stableford") {
    return {
      format: `${model} · ${getScoringModeLabel(event)}`,
      points: getStablefordLabel(event.scoringConfig),
    };
  }

  if (getScoringFamily(mode) === "match") {
    const rules = [
      Number(event.ptsPerHole || 0) > 0
        ? `${formatPoints(event.ptsPerHole)} per hole`
        : null,
      mode === "match-play" && Number(event.ptsPerMatch || 0) > 0
        ? `${formatPoints(event.ptsPerMatch)} per player match`
        : null,
      model === "Team" && Number(event.ptsPerTeamWin || 0) > 0
        ? `${formatPoints(event.ptsPerTeamWin)} per team win`
        : null,
    ].filter(Boolean);
    return {
      format: `${model} · ${getScoringModeLabel(event)}`,
      points: rules.length > 0 ? rules.join(" · ") : "No match points configured",
    };
  }

  const placementPoints = parsePlacementPoints(event.strokePoints);
  return {
    format: `${model} · ${getScoringModeLabel(event)}`,
    points: placementPoints.length > 0
      ? `Placement points · ${placementPoints.join(" / ")}`
      : "Hole-performance points",
  };
}
