import type { AdminLeagueListItem } from "@api/admin/types";

export const getAvailablePreviousSeasons = (
  leagues: AdminLeagueListItem[],
  ownerId: number,
) =>
  leagues.filter(
    (league) =>
      Number(league.adminId) === ownerId &&
      String(league.type).toLowerCase() === "season" &&
      !league.renewedLeague?.id
  );
