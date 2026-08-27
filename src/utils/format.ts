// camelCase, PascalCase, kebab-case, snake_case
export const formatCase = (str: string) => {
  if (!str) return "N/A";

  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
    .replace(/[-_]/g, " ") // kebab-case and snake_case to words
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
};

const TWENTY_FOUR_HOUR_TIME = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
const TWELVE_HOUR_TIME = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap])\.?m\.?$/i;

export const parseTimeToMinutes = (value: unknown): number | null => {
  const time = String(value ?? "").trim();
  const twelveHourMatch = time.match(TWELVE_HOUR_TIME);

  if (twelveHourMatch) {
    const hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    if (hour < 1 || hour > 12 || minute > 59) return null;

    const normalizedHour = hour % 12 + (twelveHourMatch[3].toLowerCase() === "p" ? 12 : 0);
    return normalizedHour * 60 + minute;
  }

  const twentyFourHourMatch = time.match(TWENTY_FOUR_HOUR_TIME);
  if (!twentyFourHourMatch) return null;

  const hour = Number(twentyFourHourMatch[1]);
  const minute = Number(twentyFourHourMatch[2]);
  if (hour > 23 || minute > 59) return null;

  return hour * 60 + minute;
};

const formatMinutes = (minutes: number) => {
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
};

const parseTimestamp = (value: unknown): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value ?? "").trim();
  if (!raw.includes("T")) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatTime = (value: unknown, timeZone?: string, fallback = "—") => {
  const timestamp = parseTimestamp(value);
  if (timestamp) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      ...(timeZone ? { timeZoneName: "short" as const } : {}),
    }).format(timestamp);
  }

  const minutes = parseTimeToMinutes(value);
  if (minutes !== null) return formatMinutes(minutes);

  const originalValue = String(value ?? "").trim();
  return originalValue || fallback;
};

export const compareTimes = (left: unknown, right: unknown) => {
  const leftTimestamp = parseTimestamp(left);
  const rightTimestamp = parseTimestamp(right);
  if (leftTimestamp && rightTimestamp) return leftTimestamp.getTime() - rightTimestamp.getTime();
  if (leftTimestamp) return -1;
  if (rightTimestamp) return 1;

  const leftMinutes = parseTimeToMinutes(left);
  const rightMinutes = parseTimeToMinutes(right);

  if (leftMinutes !== null && rightMinutes !== null) return leftMinutes - rightMinutes;
  if (leftMinutes !== null) return -1;
  if (rightMinutes !== null) return 1;

  return String(left ?? "").localeCompare(String(right ?? ""), undefined, { numeric: true });
};

export const toTimeInputValue = (value: unknown, timeZone?: string) => {
  const timestamp = parseTimestamp(value);
  if (timestamp) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(timestamp)
      .filter((part) => part.type !== "literal");
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.hour}:${values.minute}`;
  }

  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return "";

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const formatTimeWithOffset = (value: unknown, offsetMinutes: number) => {
  const minutes = parseTimeToMinutes(value);
  return minutes === null ? formatTime(value) : formatMinutes(minutes + offsetMinutes);
};

export const formatPhone = (phone: string) => {
  if (!phone) return "N/A";
  const cleaned = ("" + phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
