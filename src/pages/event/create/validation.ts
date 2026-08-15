import { getEventDateInputValue } from "@/utils/eventDate";

const isBlank = (value: unknown) => value == null || String(value).trim() === "";
const isPositiveNumber = (value: unknown) => Number.isFinite(Number(value)) && Number(value) > 0;
const isNonNegativeNumber = (value: unknown) => Number.isFinite(Number(value)) && Number(value) >= 0;

function parseStrokePoints(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(Number).filter((point) => Number.isFinite(point) && point >= 0);
  }

  return String(value || "")
    .split(",")
    .map((point) => Number(point.trim()))
    .filter((point) => Number.isFinite(point) && point >= 0);
}

const parsePositiveId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

function validateFlights(flights: unknown[], format: string, scoringFormat: string) {
  const assignedIds = new Set<number>();

  for (const [flightIndex, flight] of flights.entries()) {
    if (!Array.isArray(flight)) return `Flight ${flightIndex + 1} has an invalid format.`;

    let ids: Array<number | null> = [];
    if (format === "team") {
      if (flight.length !== 2) return `Flight ${flightIndex + 1} must contain two teams.`;
      ids = flight.map(parsePositiveId);
    } else if (scoringFormat === "stroke") {
      if (flight.length < 1 || flight.length > 4) {
        return `Flight ${flightIndex + 1} must contain one to four players.`;
      }
      ids = flight.map(parsePositiveId);
    } else {
      const matchups = Array.isArray(flight[0]) ? flight : [flight];
      if (matchups.length < 1 || matchups.length > 2) {
        return `Flight ${flightIndex + 1} must contain one or two matchups.`;
      }
      if (matchups.some((matchup) => !Array.isArray(matchup) || matchup.length !== 2)) {
        return `Each matchup in flight ${flightIndex + 1} must contain two players.`;
      }
      ids = matchups.flatMap((matchup) => matchup.map(parsePositiveId));
    }

    if (ids.some((id) => id === null)) return `Flight ${flightIndex + 1} contains an invalid ID.`;
    for (const id of ids as number[]) {
      if (assignedIds.has(id)) {
        return `The same ${format === "team" ? "team" : "player"} cannot be assigned twice.`;
      }
      assignedIds.add(id);
    }
  }

  return null;
}

export function validateEventForm(
  data: any,
  options: { showTeamsSection: boolean; leagueStartDate?: unknown; leagueEndDate?: unknown }
) {
  if (isBlank(data.name)) return "Event name is required.";
  if (isBlank(data.date)) return "Event date is required.";
  const eventDate = getEventDateInputValue(data.date);
  const leagueStartDate = getEventDateInputValue(options.leagueStartDate);
  const leagueEndDate = getEventDateInputValue(options.leagueEndDate);
  if (leagueStartDate && eventDate < leagueStartDate) {
    return "Event date cannot be before the league start date.";
  }
  if (leagueEndDate && eventDate > leagueEndDate) {
    return "Event date cannot be after the league end date.";
  }
  if (isBlank(data.startTime)) return "Start time is required.";
  if (!isPositiveNumber(data.interval)) return "Interval must be at least 1 minute.";
  if (!isPositiveNumber(data.courseId)) return "Please select a course.";
  if (!isPositiveNumber(data.teeId)) return "Please select a tee.";
  if (!["front", "back"].includes(String(data.startSide || ""))) {
    return "Please select a starting side.";
  }
  if (![9, 18].includes(Number(data.holes))) return "Please select 9 or 18 holes.";

  const format = String(data.format || "").toLowerCase();
  const scoringFormat = String(data.scoringFormat || "").toLowerCase();
  if (!["individual", "team"].includes(format)) return "Please select an event format.";
  if (!["stroke", "match"].includes(scoringFormat)) return "Please select a scoring format.";

  if (scoringFormat === "match") {
    if (!isNonNegativeNumber(data.ptsPerHole)) return "Points per hole must be 0 or higher.";
    if (!isNonNegativeNumber(data.ptsPerMatch)) return "Points per match must be 0 or higher.";
    if (!isNonNegativeNumber(data.ptsPerTeamWin)) return "Points per team win must be 0 or higher.";
  }

  if (scoringFormat === "stroke" && data.pointsEnabled !== false && !isBlank(data.strokePoints)) {
    if (parseStrokePoints(data.strokePoints).length === 0) {
      return "Stroke points must be comma-separated numbers, or left blank.";
    }
  }

  if (format === "team") {
    const teams = Array.isArray(data.teams) ? data.teams : [];
    if (teams.length < 2) return "Team events require at least two teams.";

    if (options.showTeamsSection) {
      const invalidTeam = teams.find(
        (team: any) => isBlank(team?.name) || !Array.isArray(team?.players) || team.players.length === 0
      );
      if (invalidTeam) return "Each team needs a name and at least one player.";
    }
  }

  const flights = Array.isArray(data.flights) ? data.flights : [];
  if (flights.length === 0) return "Please add at least one flight.";
  const flightError = validateFlights(flights, format, scoringFormat);
  if (flightError) return flightError;

  return null;
}
