export const addCalendarYear = (value: Date) => {
  const result = new Date(value);
  const nextYear = result.getUTCFullYear() + 1;
  const month = result.getUTCMonth();
  const day = result.getUTCDate();
  result.setUTCFullYear(nextYear, month, 1);
  const lastDayOfMonth = new Date(Date.UTC(nextYear, month + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDayOfMonth));
  return result;
};
