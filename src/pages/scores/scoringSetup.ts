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
