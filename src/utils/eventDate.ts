const timestampDateParts = (value: unknown, timeZone?: string) => {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .filter((part) => part.type !== "literal");
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const parseDateParts = (value: unknown, timeZone?: string) => {
  if (!value) return null;

  if (timeZone) return timestampDateParts(value, timeZone);

  const raw = value instanceof Date ? value.toISOString() : String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return timestampDateParts(value);

  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

export const getEventLocalDate = (value: unknown, timeZone?: string) => {
  const parts = parseDateParts(value, timeZone);
  if (!parts) return new Date(Number.NaN);

  return new Date(parts.year, parts.month - 1, parts.day);
};

export const formatEventDate = (
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-US",
  timeZone?: string,
) => {
  const timestamp = value instanceof Date ? value : new Date(String(value ?? ""));
  if (timeZone && !Number.isNaN(timestamp.getTime())) {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(timestamp);
  }

  return getEventLocalDate(value).toLocaleDateString(locale, options);
};

export const getEventDateInputValue = (value: unknown, timeZone?: string) => {
  const parts = parseDateParts(value, timeZone);
  if (!parts) return "";

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(
    2,
    "0",
  )}`;
};

type SchedulableEvent = { startsAt?: unknown; date?: unknown; id?: unknown };

export const sortEventsByDate = <T extends SchedulableEvent>(events: T[] = []) =>
  [...events].sort((left, right) => {
    const leftValue = left.startsAt ?? left.date;
    const rightValue = right.startsAt ?? right.date;
    const dateDiff = new Date(String(leftValue ?? "")).getTime() - new Date(String(rightValue ?? "")).getTime();
    if (Number.isFinite(dateDiff) && dateDiff !== 0) return dateDiff;

    return Number(left.id ?? 0) - Number(right.id ?? 0);
  });
