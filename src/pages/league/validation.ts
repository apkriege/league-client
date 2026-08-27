import { addCalendarYear } from "@/features/leagues/seasonDates";

const isBlank = (value: unknown) => value == null || String(value).trim() === "";
const isPositiveNumber = (value: unknown) => Number.isFinite(Number(value)) && Number(value) > 0;

type LeaguePlayerInput = {
  firstName?: unknown;
  lastName?: unknown;
  gender?: unknown;
  handicap?: unknown;
};

type LeagueTeamInput = {
  name?: unknown;
  players?: unknown;
};

type LeagueFormInput = {
  name?: unknown;
  type?: unknown;
  holeFormat?: unknown;
  format?: unknown;
  numPlayers?: unknown;
  contactFirstName?: unknown;
  contactLastName?: unknown;
  contactEmail?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  players?: unknown;
  teams?: unknown;
};

export type LeagueWizardStep = "info" | "players" | "teams" | "review";

const getPlayers = (data: LeagueFormInput): LeaguePlayerInput[] =>
  Array.isArray(data.players) ? data.players : [];

const getTeams = (data: LeagueFormInput): LeagueTeamInput[] =>
  Array.isArray(data.teams) ? data.teams : [];

export function validateLeagueInfo(data: LeagueFormInput) {

  if (isBlank(data.name)) return "League name is required.";
  if (isBlank(data.type)) return "League type is required.";
  if (!["9", "18", "mixed"].includes(String(data.holeFormat || "").toLowerCase())) {
    return "Choose whether the league plays 9 holes, 18 holes, or a mixture of both.";
  }
  if (String(data.type).toLowerCase() === "season" && isBlank(data.format)) {
    return "Season leagues require a format.";
  }
  if (isBlank(data.contactFirstName)) return "Contact first name is required.";
  if (isBlank(data.contactLastName)) return "Contact last name is required.";
  if (isBlank(data.contactEmail)) return "Contact email is required.";
  if (isBlank(data.startDate)) return "Start date is required.";
  if (isBlank(data.endDate)) return "End date is required.";
  const startDate = new Date(data.startDate as string | number | Date);
  const endDate = new Date(data.endDate as string | number | Date);
  if (Number.isNaN(startDate.getTime())) return "Start date is invalid.";
  if (Number.isNaN(endDate.getTime())) return "End date is invalid.";
  if (endDate < startDate) {
    return "End date must be on or after the start date.";
  }
  const maxEndDate = addCalendarYear(startDate);
  if (String(data.type).toLowerCase() === "season" && endDate.getTime() !== maxEndDate.getTime()) {
    return "A league season must cover exactly one calendar year.";
  }
  if (String(data.type).toLowerCase() !== "season" && endDate > maxEndDate) {
    return "End date cannot be more than one year after the start date.";
  }

  return null;
}

export function validateLeaguePlayers(data: LeagueFormInput, requirePlayers = true) {
  const players = getPlayers(data);

  if (requirePlayers && players.length === 0) return "Add at least one player.";

  const invalidPlayer = players.find(
    (player) =>
      isBlank(player?.firstName) ||
      isBlank(player?.lastName) ||
      !["male", "female"].includes(String(player?.gender || "").toLowerCase()) ||
      !Number.isFinite(Number(player?.handicap))
  );
  if (invalidPlayer) {
    return "Each player needs a first name, last name, gender, and handicap.";
  }

  return null;
}

export function validateLeagueTeams(data: LeagueFormInput, requireTeams = true) {
  const teams = getTeams(data);

  if (requireTeams && teams.length === 0) return "Create at least one team.";
  const invalidTeam = teams.find(
    (team) => isBlank(team?.name) || !Array.isArray(team?.players) || team.players.length === 0
  );
  if (requireTeams && invalidTeam) return "Each team needs a name and at least one player.";

  return null;
}

export function validateLeagueForm(
  data: LeagueFormInput,
  options: { requirePlayers?: boolean; requireTeams?: boolean } = {},
) {
  const infoError = validateLeagueInfo(data);
  if (infoError) return infoError;

  const players = getPlayers(data);
  if (!options.requirePlayers && !isPositiveNumber(data.numPlayers) && players.length === 0) {
    return "Number of players must be greater than 0.";
  }

  const playerError = validateLeaguePlayers(data, options.requirePlayers ?? false);
  if (playerError) return playerError;

  return validateLeagueTeams(data, options.requireTeams ?? false);
}

export function validateLeagueWizardStep(data: LeagueFormInput, step: LeagueWizardStep) {
  if (step === "info") return validateLeagueInfo(data);
  if (step === "players") return validateLeaguePlayers(data, true);
  if (step === "teams") return validateLeagueTeams(data, true);

  const isTeamSeason =
    String(data.type || "").toLowerCase() === "season" &&
    String(data.format || "").toLowerCase() === "team";

  return validateLeagueForm(data, { requirePlayers: true, requireTeams: isTeamSeason });
}
