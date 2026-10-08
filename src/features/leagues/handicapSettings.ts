export const handicapHoleLimits = [
  { value: "handicap-adjusted", label: "Handicap adjusted (net double bogey)" },
  ...[1, 2, 3, 4, 5].map((value) => ({ value: `par-plus-${value}`, label: `Par + ${value}` })),
  { value: "none", label: "No limit" },
];
export type HandicapHoleLimit = "handicap-adjusted" | "none" | `par-plus-${1 | 2 | 3 | 4 | 5}`;
export type HandicapSettings = {
  handicapBestRounds: number;
  handicapWindow: number;
  handicapMultiplier: number;
  handicapHoleBasis: 9 | 18;
  handicapHoleLimit: HandicapHoleLimit;
};
export const defaultHandicapSettings: HandicapSettings = {
  handicapBestRounds: 6,
  handicapWindow: 8,
  handicapMultiplier: 1,
  handicapHoleBasis: 18,
  handicapHoleLimit: "handicap-adjusted",
};
export function validateHandicapSettings(data: Partial<Record<keyof HandicapSettings, unknown>>) {
  const multiplier = Number(data.handicapMultiplier ?? 1);
  if (!Number.isFinite(multiplier) || multiplier < 0.01 || multiplier > 1) return "Use a handicap multiplier between 0.01 and 1.00.";
  const x = Number(data.handicapBestRounds ?? 6);
  const y = Number(data.handicapWindow ?? 8);
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 4 || x > y || y > 20) {
    return "Use whole numbers: 4 ≤ best rounds (X) ≤ recent rounds (Y) ≤ 20.";
  }
  if (data.handicapHoleBasis != null && ![9, 18].includes(Number(data.handicapHoleBasis))) {
    return "Choose a 9-hole or 18-hole handicap basis.";
  }
  if (data.handicapHoleLimit != null && !handicapHoleLimits.some(({ value }) => value === data.handicapHoleLimit)) {
    return "Choose a maximum hole score for handicaps.";
  }
  return null;
}
export function isValidStartingHandicap(value: unknown) {
  if (value == null || (typeof value === "string" && !value.trim())) return true;
  return (typeof value === "number" || typeof value === "string") &&
    Number.isFinite(Number(value)) && Number(value) >= -10 && Number(value) <= 54;
}
export function parseStartingHandicap(value: number | string | null | undefined): number | null {
  return value == null || String(value).trim() === "" ? null : Number(value);
}
