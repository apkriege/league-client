export type ScoreDraft<T> = { version: 2; scope: string; values: T; savedAt: string };

export function matchesDraftShape<T>(value: unknown, baseline: T): value is T {
  if (Array.isArray(baseline)) {
    return Array.isArray(value) && value.length === baseline.length &&
      baseline.every((entry, index) => matchesDraftShape(value[index], entry));
  }
  if (baseline !== null && typeof baseline === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return Object.entries(baseline).every(([key, entry]) =>
      key in value && (/Id$/.test(key) ? Reflect.get(value, key) === entry : matchesDraftShape(Reflect.get(value, key), entry)),
    );
  }
  if (typeof baseline === "number" || baseline === "") {
    return value === "" || (typeof value === "number" && Number.isFinite(value)) ||
      (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)));
  }
  return typeof value === typeof baseline;
}

export function readScoreDraft<T>(storage: Pick<Storage, "getItem">, key: string, scope: string, baseline: T): ScoreDraft<T> | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") return null;
  const version = Reflect.get(value, "version");
  const savedAt: unknown = Reflect.get(value, "savedAt");
  const values: unknown = Reflect.get(value, "values");
  if (version !== 2 || Reflect.get(value, "scope") !== scope ||
    typeof savedAt !== "string" || !Number.isFinite(Date.parse(savedAt)) ||
    !matchesDraftShape(values, baseline)) return null;
  return { version: 2, scope, savedAt, values };
}
