export const browserTimeZone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Detroit";

export const isValidIanaTimeZone = (value: unknown) => {
  const timeZone = String(value ?? "").trim();
  if (!timeZone || (timeZone !== "UTC" && !timeZone.includes("/"))) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
};
