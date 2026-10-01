import { readBrowserStorage, removeBrowserStorage } from "@/lib/browserStorage";

export const eventSetupDraftKey = (userId: number, leagueId: number) => `event-setup:v1:${userId}:${leagueId}`;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function matchesShape(value: unknown, example: unknown): boolean {
  if (Array.isArray(example)) return Array.isArray(value) && value.every(item => example.length ? matchesShape(item, example[0]) : isSafeJson(item));
  if (isRecord(example)) return isRecord(value) && Object.entries(example).every(([key, field]) => matchesShape(value[key], field));
  if (typeof example === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === typeof example;
}

function isSafeJson(value: unknown): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isSafeJson);
  return isRecord(value) && Object.entries(value).every(([key, field]) => !["__proto__", "constructor", "prototype"].includes(key) && isSafeJson(field));
}

export function readSetupDraft<T>(key: string, defaults: T, validate: (value: T) => boolean = () => true): T {
  try {
    const parsed: unknown = JSON.parse(readBrowserStorage(key) || "null");
    const isDraft = (value: unknown): value is T => matchesShape(value, defaults) && isSafeJson(value);
    return isDraft(parsed) && validate(parsed) ? parsed : defaults;
  } catch { return defaults; }
}

export function clearEventSetupDraft(userId: number, leagueId: number) {
  const key = eventSetupDraftKey(userId, leagueId);
  removeBrowserStorage(key);
  removeBrowserStorage(`${key}:series`);
  removeBrowserStorage(`${key}:mode`);
}

export function isSetupFlights(value: unknown): boolean {
  return Array.isArray(value) && value.every(flight => Array.isArray(flight) && flight.every(entry =>
    typeof entry === "number" && Number.isInteger(entry) && entry > 0 ||
    Array.isArray(entry) && entry.every(id => typeof id === "number" && Number.isInteger(id) && id > 0)));
}

export function isSetupLineups(value: unknown): boolean {
  return Array.isArray(value) && value.every(lineup => isRecord(lineup) &&
    typeof lineup.teamId === "number" && Array.isArray(lineup.playerIds) && lineup.playerIds.every(id => typeof id === "number" && Number.isInteger(id) && id > 0));
}

export function isSetupSchedule(value: unknown): boolean {
  return Array.isArray(value) && value.every(round => isRecord(round) && typeof round.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(round.date) && isSetupFlights(round.flights) && isSetupLineups(round.teamLineups));
}

export function isSetupTeams(value: unknown): boolean {
  return Array.isArray(value) && value.every(team => isRecord(team) && typeof team.id === "number" &&
    typeof team.name === "string" && Array.isArray(team.players) && team.players.every(id => typeof id === "number" && Number.isInteger(id) && id > 0));
}
