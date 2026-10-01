export function getSafeReturnPath(value: string | null | undefined, fallback = "/leagues"): string {
  if (!value?.startsWith("/") || value.startsWith("//") || Array.from(value).some(character => character === "\\" || character.charCodeAt(0) <= 32)) return fallback;
  return value;
}
