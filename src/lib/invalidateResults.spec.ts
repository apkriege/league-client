import { QueryClient } from "@tanstack/react-query";
import { expect, it } from "vitest";
import { invalidateResults } from "./invalidateResults";

it("refreshes cached profiles and rosters along with event results", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  const affected = [["league", 1], ["league", 1, "event", 2], ["player", 1, 3, "stats"], ["players", 1], ["team", 4]];
  for (const key of [...affected, ["league", 2]]) client.setQueryData(key, {});
  await invalidateResults(client, 1);
  for (const key of affected) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  expect(client.getQueryState(["league", 2])?.isInvalidated).toBe(false);
  client.clear();
});
