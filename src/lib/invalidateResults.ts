import type { QueryClient } from "@tanstack/react-query";

export const invalidateResults = (client: QueryClient, leagueId?: number) =>
  Promise.all([
    client.invalidateQueries({ queryKey: leagueId ? ["league", leagueId] : ["league"] }),
    client.invalidateQueries({ queryKey: leagueId ? ["players", leagueId] : ["players"] }),
    client.invalidateQueries({ queryKey: leagueId ? ["player", leagueId] : ["player"] }),
    client.invalidateQueries({ queryKey: ["team"] }),
    client.invalidateQueries({ queryKey: ["teams"] }),
  ]);
