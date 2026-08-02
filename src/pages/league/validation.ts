const isBlank = (value: unknown) => value == null || String(value).trim() === "";
const isPositiveNumber = (value: unknown) => Number.isFinite(Number(value)) && Number(value) > 0;

export function validateLeagueForm(data: any, options: { requirePlayers?: boolean; requireTeams?: boolean } = {}) {
  const players = Array.isArray(data.players) ? data.players : [];

  if (isBlank(data.name)) return "League name is required.";
  if (isBlank(data.type)) return "League type is required.";
  if (String(data.type).toLowerCase() === "season" && isBlank(data.format)) {
    return "Season leagues require a format.";
  }
  if (!isPositiveNumber(data.numPlayers) && players.length === 0) {
    return "Number of players must be greater than 0.";
  }
  if (isBlank(data.contactFirstName)) return "Contact first name is required.";
  if (isBlank(data.contactLastName)) return "Contact last name is required.";
  if (isBlank(data.contactEmail)) return "Contact email is required.";
  if (isBlank(data.startDate)) return "Start date is required.";
  if (isBlank(data.endDate)) return "End date is required.";
  if (new Date(data.endDate) < new Date(data.startDate)) {
    return "End date must be after the start date.";
  }
  const maxEndDate = new Date(data.startDate);
  maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
  if (new Date(data.endDate) > maxEndDate) {
    return "End date cannot be more than one year after the start date.";
  }

  if (options.requirePlayers && players.length === 0) return "Add at least one player.";

  const invalidPlayer = players.find(
    (player: any) =>
      isBlank(player?.firstName) ||
      isBlank(player?.lastName) ||
      !Number.isFinite(Number(player?.handicap))
  );
  if (invalidPlayer) return "Each player needs a first name, last name, and handicap.";

  const teams = Array.isArray(data.teams) ? data.teams : [];
  if (options.requireTeams && teams.length === 0) return "Create at least one team.";
  const invalidTeam = teams.find(
    (team: any) => isBlank(team?.name) || !Array.isArray(team?.players) || team.players.length === 0
  );
  if (options.requireTeams && invalidTeam) return "Each team needs a name and at least one player.";

  return null;
}
