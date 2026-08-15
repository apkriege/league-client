export const getEventScoringHoles = (event: any): any[] =>
  Array.isArray(event?.scoringHoles) ? event.scoringHoles : [];

export const getPlayerCourseHandicap = (entry: any): number => {
  const rawCourseHandicap = entry?.courseHandicap;
  const courseHandicap =
    rawCourseHandicap === null || rawCourseHandicap === undefined || rawCourseHandicap === ""
      ? Number.NaN
      : Number(rawCourseHandicap);
  if (!Number.isFinite(courseHandicap)) {
    throw new Error('Course Handicap is missing from the event scoring setup.');
  }
  return courseHandicap;
};

type PlayerHandicapEntry = {
  courseHandicap?: unknown;
  handicapIndex?: unknown;
  player?: {
    handicap?: unknown;
  };
};

export const getPlayerHandicapIndex = (entry: PlayerHandicapEntry): number => {
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
