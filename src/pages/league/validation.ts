import type { ValidationIssue } from "@/components/form/formValidation";
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
  teamRosterSize?: unknown;
  teamPlayersPerEvent?: unknown;
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

export function getLeagueInfoIssue(data: LeagueFormInput): ValidationIssue | null {

  if (isBlank(data.name)) return { field: "name", message: "League name is required." };
  if (isBlank(data.type)) return { field: "type", message: "League type is required." };
  if (!["9", "18", "mixed"].includes(String(data.holeFormat || "").toLowerCase())) {
    return { field: "holeFormat", message: "Choose whether the league plays 9 holes, 18 holes, or a mixture of both." };
  }
  if (String(data.type).toLowerCase() === "season" && isBlank(data.format)) {
    return { field: "format", message: "Season leagues require a format." };
  }
  if (String(data.type).toLowerCase() === "season" && String(data.format).toLowerCase() === "team") {
    const rosterSize = Number(data.teamRosterSize ?? 4);
    const playersPerEvent = Number(data.teamPlayersPerEvent ?? 2);
    if (!Number.isInteger(rosterSize) || rosterSize < 1 || rosterSize > 4) {
      return { field: "teamRosterSize", message: "Team roster size must be a whole number from 1 to 4." };
    }
    if (!Number.isInteger(playersPerEvent) || playersPerEvent < 1 || playersPerEvent > rosterSize) {
      return { field: "teamPlayersPerEvent", message: "Players per team event must be between 1 and the team roster size." };
    }
  }
  if (isBlank(data.contactFirstName)) return { field: "contactFirstName", message: "Contact first name is required." };
  if (isBlank(data.contactLastName)) return { field: "contactLastName", message: "Contact last name is required." };
  if (isBlank(data.contactEmail)) return { field: "contactEmail", message: "Contact email is required." };
  if (isBlank(data.startDate)) return { field: "startDate", message: "Start date is required." };
  if (isBlank(data.endDate)) return { field: "endDate", message: "End date is required." };
  const startDate = new Date(data.startDate as string | number | Date);
  const endDate = new Date(data.endDate as string | number | Date);
  if (Number.isNaN(startDate.getTime())) return { field: "startDate", message: "Start date is invalid." };
  if (Number.isNaN(endDate.getTime())) return { field: "endDate", message: "End date is invalid." };
  if (endDate < startDate) {
    return { field: "endDate", message: "End date must be on or after the start date." };
  }
  const maxEndDate = addCalendarYear(startDate);
  if (String(data.type).toLowerCase() === "season" && endDate.getTime() !== maxEndDate.getTime()) {
    return { field: "endDate", message: "A league season must cover exactly one calendar year." };
  }
  if (String(data.type).toLowerCase() !== "season" && endDate > maxEndDate) {
    return { field: "endDate", message: "End date cannot be more than one year after the start date." };
  }

  return null;
}

export function validateLeagueInfo(data: LeagueFormInput) {
  return getLeagueInfoIssue(data)?.message ?? null;
}

export function validateLeaguePlayers(data: LeagueFormInput, requirePlayers = true) {
  const players = getPlayers(data);

  if (requirePlayers && players.length === 0) return "Add at least one player.";

  const invalidPlayer = players.find(
    (player) =>
      isBlank(player?.firstName) ||
      isBlank(player?.lastName) ||
      !["male", "female"].includes(String(player?.gender || "").toLowerCase()) ||
      isBlank(player?.handicap) ||
      !Number.isFinite(Number(player?.handicap)) ||
      Number(player?.handicap) < -10 || Number(player?.handicap) > 54
  );
  if (invalidPlayer) {
    return "Each player needs a first name, last name, gender, and handicap from -10 to 54.";
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
  const rosterSize = Number(data.teamRosterSize ?? 4);
  const oversizedTeam = teams.find((team) => Array.isArray(team.players) && team.players.length > rosterSize);
  if (oversizedTeam) return `Teams may have at most ${rosterSize} players.`;

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
