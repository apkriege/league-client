export const getEventScoringHoles = (event: any): any[] =>
  Array.isArray(event?.scoringHoles) ? event.scoringHoles : [];

export const getPlayerScoringHoles = (event: any, entry: any): any[] => {
  const gender = String(entry?.player?.gender || entry?.gender || '').toLowerCase();
  const genderHoles = event?.scoringHolesByGender?.[gender];
  return Array.isArray(genderHoles) ? genderHoles : getEventScoringHoles(event);
};

export type ScoringHandicapEntry = {
  handicapIndex?: unknown;
  player?: {
    handicap?: unknown;
  };
};

export const getPlayerHandicapIndex = (entry: ScoringHandicapEntry): number => {
  const rawHandicapIndex = entry?.handicapIndex;
  const handicapIndex =
    rawHandicapIndex === null || rawHandicapIndex === undefined || rawHandicapIndex === ""
      ? Number(entry?.player?.handicap)
      : Number(rawHandicapIndex);

  if (!Number.isFinite(handicapIndex)) {
    throw new Error("Handicap Index is missing from the event scoring setup.");
  }

  return handicapIndex;
};
