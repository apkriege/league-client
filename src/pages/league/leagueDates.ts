import dayjs from "dayjs";

export const getLeagueDateInputValue = (value: unknown) => {
  const parsed = dayjs(value as string | number | Date | null | undefined);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

export const getMaximumLeagueEndDate = (startDate: unknown) => {
  const parsedStartDate = dayjs(startDate as string | number | Date | null | undefined);
  return parsedStartDate.isValid() ? parsedStartDate.add(1, "year").format("YYYY-MM-DD") : "";
};

export const clampLeagueEndDate = (startDate: unknown, endDate: unknown) => {
  const parsedStartDate = dayjs(startDate as string | number | Date | null | undefined);
  if (!parsedStartDate.isValid()) return endDate;

  const parsedEndDate = dayjs(endDate as string | number | Date | null | undefined);
  const maximumEndDate = parsedStartDate.add(1, "year");

  if (!parsedEndDate.isValid() || parsedEndDate.isBefore(parsedStartDate, "day")) {
    return parsedStartDate.toDate();
  }

  if (parsedEndDate.isAfter(maximumEndDate, "day")) {
    return maximumEndDate.toDate();
  }

  return parsedEndDate.toDate();
};
