export const formatSigned = (value: number | null, suffix = "") => {
  if (value == null) return "—";
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}${suffix}`;
};

export const formatRecord = (wins: number, losses: number, ties: number) =>
  `${wins}-${losses}${ties > 0 ? `-${ties}` : ""}`;

export const comparisonLabel = (value: number | null) => {
  if (value == null) return "No league comparison";
  if (Math.abs(value) < 0.05) return "Even with league";
  return value < 0
    ? `${Math.abs(value).toFixed(1)} better than league`
    : `${value.toFixed(1)} above league`;
};

export const valueTone = (value: number | null) => {
  if (value == null || Math.abs(value) < 0.05) return "text-slate-500";
  return value < 0 ? "text-emerald-700" : "text-amber-700";
};
