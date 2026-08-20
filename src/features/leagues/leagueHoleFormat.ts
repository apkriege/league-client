export const LEAGUE_HOLE_FORMATS = ["9", "18", "mixed"] as const;

export type LeagueHoleFormat = (typeof LEAGUE_HOLE_FORMATS)[number];

export const normalizeLeagueHoleFormat = (value: unknown): LeagueHoleFormat => {
  const normalized = String(value ?? "18").trim().toLowerCase();
  return LEAGUE_HOLE_FORMATS.find((format) => format === normalized) ?? "18";
};

export const getHandicapHoleCount = (holeFormat: unknown): 9 | 18 =>
  normalizeLeagueHoleFormat(holeFormat) === "9" ? 9 : 18;

export const getFixedEventHoleCount = (holeFormat: unknown): 9 | 18 | null => {
  const normalized = normalizeLeagueHoleFormat(holeFormat);
  if (normalized === "9") return 9;
  if (normalized === "18") return 18;
  return null;
};

export const getLeagueHoleFormatLabel = (holeFormat: unknown) => {
  const normalized = normalizeLeagueHoleFormat(holeFormat);
  return normalized === "mixed" ? "Mixed 9/18 holes" : `${normalized} holes`;
};
