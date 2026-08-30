export type CompetitionModel = "individual" | "team";

export type ScoringMode =
  | "stroke-play"
  | "match-play"
  | "stableford"
  | "maximum-score"
  | "best-ball"
  | "four-ball-match"
  | "scramble"
  | "alternate-shot";

export type StablefordPointScale = {
  albatrossOrBetter: number;
  eagle: number;
  birdie: number;
  par: number;
  bogey: number;
  doubleBogeyOrWorse: number;
};

export type MaximumScoreRule =
  | { type: "fixed"; strokes: number }
  | { type: "relative-to-par"; strokesOverPar: number }
  | { type: "net-double-bogey" };

export type ScoringConfiguration = {
  handicapAllowance: number;
  stablefordPointScale?: StablefordPointScale;
  maximumScore?: MaximumScoreRule;
};

export type ScoringModeDefinition = {
  id: ScoringMode;
  label: string;
  shortLabel: string;
  description: string;
  models: readonly CompetitionModel[];
  input: "player" | "team";
};

export const DEFAULT_STABLEFORD_SCALE: StablefordPointScale = {
  albatrossOrBetter: 4,
  eagle: 4,
  birdie: 3,
  par: 2,
  bogey: 1,
  doubleBogeyOrWorse: 0,
};

export const SCORING_MODES: Record<ScoringMode, ScoringModeDefinition> = {
  "stroke-play": {
    id: "stroke-play",
    label: "Stroke Play",
    shortLabel: "Stroke",
    description: "Lowest net total wins. Team events combine every assigned player's score.",
    models: ["individual", "team"],
    input: "player",
  },
  "match-play": {
    id: "match-play",
    label: "Match Play",
    shortLabel: "Match",
    description: "Head-to-head play decided by holes won, with optional hole and match points.",
    models: ["individual", "team"],
    input: "player",
  },
  stableford: {
    id: "stableford",
    label: "Stableford",
    shortLabel: "Stableford",
    description: "Each hole awards points from the player's net score relative to par.",
    models: ["individual", "team"],
    input: "player",
  },
  "maximum-score": {
    id: "maximum-score",
    label: "Maximum Score",
    shortLabel: "Max Score",
    description: "Stroke play with a configurable competition cap on every hole.",
    models: ["individual", "team"],
    input: "player",
  },
  "best-ball": {
    id: "best-ball",
    label: "Best Ball",
    shortLabel: "Best Ball",
    description: "Every player records a score; each team uses its best net score on each hole.",
    models: ["team"],
    input: "player",
  },
  "four-ball-match": {
    id: "four-ball-match",
    label: "Four-Ball Match Play",
    shortLabel: "Four-Ball",
    description: "Each side's best net score competes hole-by-hole against the other team.",
    models: ["team"],
    input: "player",
  },
  scramble: {
    id: "scramble",
    label: "Scramble",
    shortLabel: "Scramble",
    description: "The team selects one ball and records a single shared score on every hole.",
    models: ["team"],
    input: "team",
  },
  "alternate-shot": {
    id: "alternate-shot",
    label: "Alternate Shot",
    shortLabel: "Alt Shot",
    description: "Two teammates alternate strokes and record one shared team score per hole.",
    models: ["team"],
    input: "team",
  },
};

export const getScoringModesForModel = (model: CompetitionModel) =>
  Object.values(SCORING_MODES).filter((mode) => mode.models.includes(model));

export const getScoringFamily = (mode: ScoringMode): "stroke" | "match" =>
  mode === "match-play" || mode === "four-ball-match" ? "match" : "stroke";

export const getScoringFamilyForEvent = (event: {
  format?: unknown;
  scoringMode?: unknown;
}): "stroke" | "match" => getScoringFamily(deriveScoringMode(event));

export const deriveScoringMode = (event: {
  format?: unknown;
  scoringMode?: unknown;
}): ScoringMode => {
  const explicit = String(event.scoringMode || "") as ScoringMode;
  if (SCORING_MODES[explicit]) return explicit;
  return String(event.format || "").toLowerCase() === "team" ? "best-ball" : "stroke-play";
};

export const createDefaultScoringConfiguration = (mode: ScoringMode): ScoringConfiguration => ({
  handicapAllowance: 1,
  ...(mode === "stableford" ? { stablefordPointScale: { ...DEFAULT_STABLEFORD_SCALE } } : {}),
  ...(mode === "maximum-score"
    ? { maximumScore: { type: "relative-to-par" as const, strokesOverPar: 2 } }
    : {}),
});

export const isSharedTeamScoringMode = (mode: ScoringMode) =>
  SCORING_MODES[mode].input === "team";

export const getScoringModeLabel = (event: {
  format?: unknown;
  scoringMode?: unknown;
}) => SCORING_MODES[deriveScoringMode(event)].label;

export const getTeamSizeError = (mode: ScoringMode, playerCount: number) => {
  if (mode === "four-ball-match" && playerCount !== 2) {
    return "Four-ball match play requires exactly two players on every team.";
  }
  if (mode === "alternate-shot" && playerCount !== 2) {
    return "Alternate shot requires exactly two players on every team.";
  }
  if (mode === "scramble" && (playerCount < 2 || playerCount > 4)) {
    return "Scramble teams require two to four players.";
  }
  return null;
};
