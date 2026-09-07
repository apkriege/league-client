import apiClient from "@api/client";

type SavedParticipant = { participantId: string; name: string; scores: Record<string, number> };
export type SavedScores = { flightId: number; players: SavedParticipant[]; teamScores: SavedParticipant[] };
export type ScoreRevision = {
  id: number;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
  metadata: { before: SavedScores; after: SavedScores };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

const isParticipant = (value: unknown): value is SavedParticipant =>
  isRecord(value) && typeof value.participantId === "string" && typeof value.name === "string" && isRecord(value.scores) &&
  Object.values(value.scores).every((score) => typeof score === "number" && Number.isFinite(score));

const isSnapshot = (value: unknown): value is SavedScores =>
  isRecord(value) && typeof value.flightId === "number" &&
  Array.isArray(value.players) && value.players.every(isParticipant) &&
  Array.isArray(value.teamScores) && value.teamScores.every(isParticipant);

const isRevision = (value: unknown): value is ScoreRevision =>
  isRecord(value) && typeof value.id === "number" && typeof value.createdAt === "string" &&
  (value.user === null || (isRecord(value.user) && typeof value.user.firstName === "string" && typeof value.user.lastName === "string")) &&
  isRecord(value.metadata) && isSnapshot(value.metadata.before) && isSnapshot(value.metadata.after);

export async function getScoreHistory(leagueId: number, eventId: number) {
  const { data } = await apiClient.get<unknown>(`/leagues/${leagueId}/events/${eventId}/score-history`);
  if (!Array.isArray(data) || !data.every(isRevision)) throw new Error("Unable to read score history.");
  return data;
}

export const restoreScoreRevision = (leagueId: number, eventId: number, revisionId: number, version: "before" | "after" = "after") =>
  apiClient.post(`/leagues/${leagueId}/events/${eventId}/score-history/${revisionId}/restore`, { version });
