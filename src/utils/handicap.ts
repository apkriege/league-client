export const formatHandicap = (value: unknown, fallback = "—") => {
  if (value == null || value === "") return fallback;

  const handicap = Number(value);
  return Number.isFinite(handicap) ? handicap.toFixed(2) : fallback;
};

export const formatWholeHandicap = (value: unknown, fallback = "-") => {
  if (value == null || value === "") return fallback;

  const handicap = Number(value);
  return Number.isFinite(handicap) ? String(Math.round(handicap)) : fallback;
};
