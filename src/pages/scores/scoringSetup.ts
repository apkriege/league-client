export const getEventScoringHoles = (event: any): any[] =>
  Array.isArray(event?.scoringHoles) ? event.scoringHoles : [];

export const getPlayerScoringHoles = (event: any, entry: any): any[] => {
  const gender = String(entry?.player?.gender || entry?.gender || '').toLowerCase();
  const genderHoles = event?.scoringHolesByGender?.[gender];
  return Array.isArray(genderHoles) ? genderHoles : getEventScoringHoles(event);
};

export type ScoringHandicapEntry = {
  handicapIndex?: unknown;
  playerId?: number;
  firstRoundHandicap?: { handicapHoleBasis: 9 | 18; handicapHoleLimit: string; handicapMultiplier?: number; rating: number; slope: number } | null;
  player?: {
    handicap?: unknown;
  };
};

export const getPlayerHandicapIndex = (entry: ScoringHandicapEntry): number => {
  const raw = Object.hasOwn(entry, "handicapIndex") ? entry.handicapIndex : entry.player?.handicap;
  if (raw == null || raw === "") return Number.NaN;
  const handicap = Number(raw);
  return Number.isFinite(handicap) ? handicap : Number.NaN;
};

export function getPreviewHandicap(entry: ScoringHandicapEntry, holes: Array<{ par: number }>, scores: unknown[]): number {
  const stored = getPlayerHandicapIndex(entry);
  const setup = entry.firstRoundHandicap;
  if (!setup && Number.isFinite(stored)) return stored;
  if (!setup || (holes.length !== 9 && holes.length !== 18) || scores.length !== holes.length ||
    scores.some((score) => !Number.isInteger(Number(score)) || Number(score) <= 0)) return Number.NaN;
  const adjusted = scores.reduce<number>((sum, score, index) => {
    const maximum = setup.handicapHoleLimit === "none" ? Infinity :
      holes[index].par + (setup.handicapHoleLimit === "handicap-adjusted" ? 5 : Number(setup.handicapHoleLimit.slice("par-plus-".length)));
    return sum + Math.min(Number(score), maximum);
  }, 0);
  const normalized = ((adjusted - setup.rating) * 113 / setup.slope) * setup.handicapHoleBasis / holes.length;
  const differential = Math.round((normalized + Number.EPSILON * Math.max(1, Math.abs(normalized))) * 100) / 100;
  const modified = Math.min(54 * setup.handicapHoleBasis / 18, differential * (setup.handicapMultiplier ?? 1));
  const handicap = Math.round((modified + Number.EPSILON * Math.max(1, Math.abs(modified))) * 100) / 100;
  return handicap === 0 ? 0 : handicap;
}
