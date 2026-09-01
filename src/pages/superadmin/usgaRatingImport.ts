import type { TeeFormData } from "./courseAdminForm";

export type UsgaGender = "male" | "female";

export type UsgaRatingRow = {
  teeId: number | null;
  teeName: string;
  gender: UsgaGender;
  par: number;
  length: number | null;
  rating: number;
  slope: number;
  frontRating: number | null;
  frontSlope: number | null;
  backRating: number | null;
  backSlope: number | null;
};

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const splitLine = (line: string) => {
  if (line.includes("\t")) return line.split("\t").map((value) => value.trim());
  if (line.includes("|")) {
    return line
      .split("|")
      .map((value) => value.trim())
      .filter((value, index, values) => value || (index > 0 && index < values.length - 1));
  }
  return [];
};

const parseNumber = (value: string | undefined) => {
  const normalized = String(value ?? "").replace(/,/g, "").trim();
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const parseRatingSlopePair = (value: string | undefined) => {
  const [ratingValue, slopeValue] = String(value ?? "").split("/");
  return {
    rating: parseNumber(ratingValue),
    slope: parseNumber(slopeValue),
  };
};

const findColumn = (headers: string[], ...names: string[]) => {
  const normalizedNames = names.map(normalizeHeader);
  return headers.findIndex((header) => normalizedNames.includes(normalizeHeader(header)));
};

const requiredNumber = (value: string | undefined, label: string, lineNumber: number) => {
  const parsed = parseNumber(value);
  if (parsed == null) throw new Error(`${label} is missing on pasted row ${lineNumber}.`);
  return parsed;
};

export const parseUsgaRatingTable = (input: string): UsgaRatingRow[] => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const table = lines.map(splitLine).filter((row) => row.length > 1);
  const headerIndex = table.findIndex(
    (row) => findColumn(row, "Tee Name") >= 0 && findColumn(row, "Gender") >= 0,
  );

  if (headerIndex < 0) {
    throw new Error("Copy the USGA table including its Tee Name and Gender header row.");
  }

  const headers = table[headerIndex];
  const columns = {
    teeName: findColumn(headers, "Tee Name"),
    gender: findColumn(headers, "Gender"),
    par: findColumn(headers, "Par"),
    rating: findColumn(headers, "Course Rating"),
    slope: findColumn(headers, "Slope Rating"),
    ratingFront: findColumn(headers, "RatingF9"),
    ratingBack: findColumn(headers, "RatingB9"),
    front: findColumn(headers, "Front (9)"),
    back: findColumn(headers, "Back (9)"),
    slopeFront: findColumn(headers, "Slope (F9)"),
    slopeBack: findColumn(headers, "Slope (B9)"),
    teeId: findColumn(headers, "TeeID", "Tee ID"),
    length: findColumn(headers, "Length"),
  };

  if ([columns.par, columns.rating, columns.slope].some((index) => index < 0)) {
    throw new Error("The pasted USGA table is missing required rating columns.");
  }

  const rows = table.slice(headerIndex + 1).flatMap((values, rowIndex): UsgaRatingRow[] => {
    const teeName = values[columns.teeName]?.trim();
    const rawGender = values[columns.gender]?.trim().toLowerCase();
    if (!teeName || !["m", "male", "f", "female"].includes(rawGender)) return [];

    const gender: UsgaGender = rawGender.startsWith("f") ? "female" : "male";
    const frontPair = parseRatingSlopePair(values[columns.front]);
    const backPair = parseRatingSlopePair(values[columns.back]);
    const lineNumber = headerIndex + rowIndex + 2;

    return [{
      teeId: parseNumber(values[columns.teeId]),
      teeName,
      gender,
      par: requiredNumber(values[columns.par], "Par", lineNumber),
      length: parseNumber(values[columns.length]),
      rating: requiredNumber(values[columns.rating], "Course Rating", lineNumber),
      slope: requiredNumber(values[columns.slope], "Slope Rating", lineNumber),
      frontRating: frontPair.rating ?? parseNumber(values[columns.ratingFront]),
      frontSlope: frontPair.slope ?? parseNumber(values[columns.slopeFront]),
      backRating: backPair.rating ?? parseNumber(values[columns.ratingBack]),
      backSlope: backPair.slope ?? parseNumber(values[columns.slopeBack]),
    }];
  });

  if (rows.length === 0) throw new Error("No USGA tee rows were found in the pasted table.");
  return rows;
};

const normalizeTeeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b(male|female|men|women)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

export const suggestUsgaTeeMatches = (rows: UsgaRatingRow[], tees: TeeFormData[]) =>
  rows.map((row) => {
    const normalizedName = normalizeTeeName(row.teeName);
    const matches = tees
      .map((tee, index) => ({ tee, index }))
      .filter(({ tee }) => normalizeTeeName(tee.name) === normalizedName);
    if (matches.length === 0) return -1;
    if (matches.length === 1 || row.length == null) return matches[0].index;
    return matches.sort(
      (left, right) =>
        Math.abs(Number(left.tee.distance || 0) - row.length!) -
        Math.abs(Number(right.tee.distance || 0) - row.length!),
    )[0].index;
  });

const setIfPresent = (current: string, value: number | null) =>
  value == null ? current : String(value);

export const applyUsgaRatingRows = (
  tees: TeeFormData[],
  rows: UsgaRatingRow[],
  teeIndexes: number[],
) => {
  const updated = tees.map((tee) => ({ ...tee }));
  const assigned = new Set<string>();

  rows.forEach((row, rowIndex) => {
    const teeIndex = teeIndexes[rowIndex];
    if (!Number.isInteger(teeIndex) || teeIndex < 0) return;
    if (!updated[teeIndex]) throw new Error(`Choose a valid local tee for ${row.teeName}.`);

    const assignmentKey = `${teeIndex}:${row.gender}`;
    if (assigned.has(assignmentKey)) {
      throw new Error(`Only one ${row.gender} USGA row can be assigned to each local tee.`);
    }
    assigned.add(assignmentKey);

    const tee = updated[teeIndex];
    if (row.gender === "male") {
      updated[teeIndex] = {
        ...tee,
        ratingMen: String(row.rating),
        slopeMen: String(row.slope),
        ratingFrontMen: setIfPresent(tee.ratingFrontMen, row.frontRating),
        slopeFrontMen: setIfPresent(tee.slopeFrontMen, row.frontSlope),
        ratingBackMen: setIfPresent(tee.ratingBackMen, row.backRating),
        slopeBackMen: setIfPresent(tee.slopeBackMen, row.backSlope),
      };
    } else {
      updated[teeIndex] = {
        ...tee,
        ratingWomen: String(row.rating),
        slopeWomen: String(row.slope),
        ratingFrontWomen: setIfPresent(tee.ratingFrontWomen, row.frontRating),
        slopeFrontWomen: setIfPresent(tee.slopeFrontWomen, row.frontSlope),
        ratingBackWomen: setIfPresent(tee.ratingBackWomen, row.backRating),
        slopeBackWomen: setIfPresent(tee.slopeBackWomen, row.backSlope),
      };
    }
  });

  return updated;
};
