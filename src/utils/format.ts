import dayjs from "dayjs";

// camelCase, PascalCase, kebab-case, snake_case
export const formatCase = (str: string) => {
  if (!str) return "N/A";

  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to words
    .replace(/[-_]/g, " ") // kebab-case and snake_case to words
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
};

// using dayjs
export const convertTime = (time24: string) => {
  return dayjs(time24, "HH:mm").format("h:mm A");
};
