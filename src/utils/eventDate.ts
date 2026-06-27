const parseEventDateParts = (value: unknown) => {
  if (!value) return null;

  const raw = value instanceof Date ? value.toISOString() : String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;

  return { year, month, day };
};

export const getEventLocalDate = (value: unknown) => {
  const parts = parseEventDateParts(value);
  if (!parts) return new Date(value as any);

  return new Date(parts.year, parts.month - 1, parts.day);
};

export const formatEventDate = (
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
  locale = "en-US"
) => getEventLocalDate(value).toLocaleDateString(locale, options);

export const getEventDateInputValue = (value: unknown) => {
  const parts = parseEventDateParts(value);
  if (!parts) return "";

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(
    2,
    "0"
  )}`;
};
