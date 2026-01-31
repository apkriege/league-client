import apiClient from "@api/client";

// for the home page
// upcoming events 5 next events
// current handicap - with the last 10 round trends as a graph
// current stats compared to the league
// league leaderboard - top 5 players, teams, etc.

export async function getPlayerEvents(leagueId: number, playerId: number) {
  const events = await apiClient.get(`/dashboard/leagues/${leagueId}/players/${playerId}/events`);
  return events.data;
}

export async function getPlayerStats(leagueId: number, playerId: number) {
  const stats = await apiClient.get(`/dashboard/leagues/${leagueId}/players/${playerId}/stats`);
  return stats.data;
}

export async function getLeagueStats(leagueId: number, playerId?: number) {
  console.log("Fetching league stats for leagueId:", leagueId, "playerId:", playerId);
  const stats = await apiClient.get(
    `/dashboard/leagues/${leagueId}/stats${playerId ? `?playerId=${playerId}` : ""}`
  );
  return stats.data;
}

export async function getLeagueLeaderboards(leagueId: number) {
  const leaderboards = await apiClient.get(`/dashboard/leagues/${leagueId}/leaderboards`);
  return leaderboards.data;
}
