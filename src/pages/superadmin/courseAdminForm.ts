import type { CoursePayload, CourseTeePayload } from "@api/courses";
import { browserTimeZone, isValidIanaTimeZone } from "../../utils/timeZone";

export type CourseFormData = {
  clubId: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  timeZone: string;
  accessType: string;
  numHoles: string;
  par: string;
  externalProvider: string;
  externalId: string;
  scorecardUrl: string;
  usgaCourseId: string;
};

export type ClubFormData = {
  name: string;
  description: string;
  location: string;
  phone: string;
  link: string;
  accessType: string;
};

export type HoleFormData = {
  num: number;
  par: string;
  dis: string;
  hcp: string;
};

export type TeeFormData = {
  id?: number;
  name: string;
  color: string;
  distance: string;
  par: string;
  frontPar: string;
  backPar: string;
  slopeMen: string;
  slopeFrontMen: string;
  slopeBackMen: string;
  slopeWomen: string;
  slopeFrontWomen: string;
  slopeBackWomen: string;
  ratingMen: string;
  ratingFrontMen: string;
  ratingBackMen: string;
  ratingWomen: string;
  ratingFrontWomen: string;
  ratingBackWomen: string;
  holes: HoleFormData[];
  holesWomen: HoleFormData[];
};

type CourseTeeRecord = {
  id?: number;
  name?: string | null;
  color?: string | null;
  distance?: string | number | null;
  par?: string | number | null;
  frontPar?: string | number | null;
  backPar?: string | number | null;
  slopeMen?: string | number | null;
  slopeFrontMen?: string | number | null;
  slopeBackMen?: string | number | null;
  slopeWomen?: string | number | null;
  slopeFrontWomen?: string | number | null;
  slopeBackWomen?: string | number | null;
  ratingMen?: string | number | null;
  ratingFrontMen?: string | number | null;
  ratingBackMen?: string | number | null;
  ratingWomen?: string | number | null;
  ratingFrontWomen?: string | number | null;
  ratingBackWomen?: string | number | null;
  holes?: Array<{
    num?: number | null;
    par?: string | number | null;
    dis?: string | number | null;
    hcp?: string | number | null;
  }> | null;
  holesWomen?: Array<{
    num?: number | null;
    par?: string | number | null;
    dis?: string | number | null;
    hcp?: string | number | null;
  }> | null;
};

export type CourseRecord = {
  id: number;
  clubId?: number;
  name: string;
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  timeZone?: string | null;
  accessType?: string | null;
  numHoles?: number | null;
  par?: number | null;
  externalProvider?: string | null;
  externalId?: string | null;
  scorecardUrl?: string | null;
  usgaCourseId?: string | number | null;
  club?: { id?: number; name?: string | null; location?: string | null } | null;
  tees?: CourseTeeRecord[] | null;
};

export const emptyCourseForm: CourseFormData = {
  clubId: "",
  name: "",
  description: "",
  location: "",
  phone: "",
  timeZone: browserTimeZone,
  accessType: "public",
  numHoles: "18",
  par: "72",
  externalProvider: "",
  externalId: "",
  scorecardUrl: "",
  usgaCourseId: "",
};

export const emptyClubForm: ClubFormData = {
  name: "",
  description: "",
  location: "",
  phone: "",
  link: "",
  accessType: "public",
};

export const buildEmptyHoles = (count: number): HoleFormData[] =>
  Array.from({ length: count }, (_, index) => ({
    num: index + 1,
    par: "4",
    dis: "0",
    hcp: String(index + 1),
  }));

export const buildEmptyTee = (count: number): TeeFormData => ({
  name: "",
  color: "",
  distance: "",
  par: count === 9 ? "36" : "72",
  frontPar: "36",
  backPar: count === 9 ? "0" : "36",
  slopeMen: "",
  slopeFrontMen: "",
  slopeBackMen: "",
  slopeWomen: "",
  slopeFrontWomen: "",
  slopeBackWomen: "",
  ratingMen: "",
  ratingFrontMen: "",
  ratingBackMen: "",
  ratingWomen: "",
  ratingFrontWomen: "",
  ratingBackWomen: "",
  holes: buildEmptyHoles(count),
  holesWomen: buildEmptyHoles(count),
});

export const ensureHoleCount = (holes: HoleFormData[], count: number) =>
  Array.from({ length: count }, (_, index) => ({
    num: index + 1,
    par: holes[index]?.par ?? "4",
    dis: holes[index]?.dis ?? "0",
    hcp: holes[index]?.hcp ?? String(index + 1),
  }));

export const toNullableNumber = (value: string) => {
  if (value.trim() === "") return null;
  return Number(value);
};

export const courseToEditorState = (course: CourseRecord) => {
  const holeCount = Number(course.numHoles || 18) || 18;
  const form: CourseFormData = {
    clubId: String(course.clubId ?? course.club?.id ?? ""),
    name: String(course.name || ""),
    description: String(course.description || ""),
    location: String(course.location || ""),
    phone: String(course.phone || ""),
    timeZone: String(course.timeZone || browserTimeZone),
    accessType: String(course.accessType || "public"),
    numHoles: String(holeCount),
    par: String(course.par ?? 72),
    externalProvider: String(course.externalProvider || ""),
    externalId: String(course.externalId || ""),
    scorecardUrl: String(course.scorecardUrl || ""),
    usgaCourseId: course.usgaCourseId == null ? "" : String(course.usgaCourseId),
  };
  const tees = Array.isArray(course.tees)
    ? course.tees.map((tee): TeeFormData => ({
        id: tee.id != null ? Number(tee.id) : undefined,
        name: String(tee.name || ""),
        color: String(tee.color || ""),
        distance: String(tee.distance ?? ""),
        par: String(tee.par ?? 0),
        frontPar: String(tee.frontPar ?? 0),
        backPar: String(tee.backPar ?? 0),
        slopeMen: String(tee.slopeMen ?? ""),
        slopeFrontMen: String(tee.slopeFrontMen ?? ""),
        slopeBackMen: String(tee.slopeBackMen ?? ""),
        slopeWomen: tee.slopeWomen == null ? "" : String(tee.slopeWomen),
        slopeFrontWomen: tee.slopeFrontWomen == null ? "" : String(tee.slopeFrontWomen),
        slopeBackWomen: tee.slopeBackWomen == null ? "" : String(tee.slopeBackWomen),
        ratingMen: String(tee.ratingMen ?? ""),
        ratingFrontMen: String(tee.ratingFrontMen ?? ""),
        ratingBackMen: String(tee.ratingBackMen ?? ""),
        ratingWomen: tee.ratingWomen == null ? "" : String(tee.ratingWomen),
        ratingFrontWomen: tee.ratingFrontWomen == null ? "" : String(tee.ratingFrontWomen),
        ratingBackWomen: tee.ratingBackWomen == null ? "" : String(tee.ratingBackWomen),
        holes: ensureHoleCount(
          Array.isArray(tee.holes)
            ? tee.holes.map((hole, index) => ({
                num: Number(hole.num ?? index + 1),
                par: String(hole.par ?? 4),
                dis: String(hole.dis ?? 0),
                hcp: String(hole.hcp ?? index + 1),
              }))
            : [],
          holeCount
        ),
        holesWomen: ensureHoleCount(
          Array.isArray(tee.holesWomen)
            ? tee.holesWomen.map((hole, index) => ({
                num: Number(hole.num ?? index + 1),
                par: String(hole.par ?? 4),
                dis: String(hole.dis ?? 0),
                hcp: String(hole.hcp ?? index + 1),
              }))
            : [],
          holeCount
        ),
      }))
    : [];

  return { form, tees };
};

export const getCourseValidationError = (
  form: CourseFormData,
  tees: TeeFormData[]
): string | null => {
  if (!form.clubId) return "Please select a club.";
  if (!form.name.trim()) return "Course name is required.";
  if (!isValidIanaTimeZone(form.timeZone)) {
    return "Enter a valid IANA timezone, such as America/Detroit.";
  }

  const holeCount = Number(form.numHoles);
  if (![9, 18].includes(holeCount)) {
    return "A course must be one independently playable 9-hole or 18-hole layout.";
  }
  const coursePar = Number(form.par);
  const minimumPar = holeCount === 9 ? 18 : 36;
  const maximumPar = holeCount === 9 ? 54 : 108;
  if (!Number.isInteger(coursePar) || coursePar < minimumPar || coursePar > maximumPar) {
    return `Course par must be a whole number from ${minimumPar} to ${maximumPar}.`;
  }
  if (tees.length === 0) return "At least one tee is required.";

  const names = new Set<string>();
  const validateScorecard = (
    holes: TeeFormData["holes"],
    teeIndex: number,
    label: string
  ) => {
    if (holes.length !== holeCount) {
      return `${label} on tee ${teeIndex + 1} must have ${holeCount} holes.`;
    }
    const expected = Array.from({ length: holeCount }, (_, index) => index + 1);
    const numbers = holes.map((hole) => Number(hole.num)).sort((left, right) => left - right);
    const ranks = holes.map((hole) => Number(hole.hcp)).sort((left, right) => left - right);
    if (numbers.some((value, index) => value !== expected[index])) {
      return `${label} hole numbers must use 1 through ${holeCount} once.`;
    }
    if (ranks.some((value, index) => value !== expected[index])) {
      return `${label} handicap ranks must use 1 through ${holeCount} once.`;
    }
    for (const hole of holes) {
      if (!Number.isInteger(Number(hole.par)) || Number(hole.par) < 2 || Number(hole.par) > 7) {
        return `Hole ${hole.num} on tee ${teeIndex + 1} needs a whole-number par from 2 to 7.`;
      }
      if (!Number.isInteger(Number(hole.dis)) || Number(hole.dis) < 0 || Number(hole.dis) > 900) {
        return `Hole ${hole.num} on tee ${teeIndex + 1} needs a valid whole-number distance.`;
      }
    }
    return null;
  };

  const validateRatingPair = (
    rating: unknown,
    slope: unknown,
    label: string,
    minRating: number,
    maxRating: number
  ) => {
    const hasRating = rating != null && String(rating).trim() !== "";
    const hasSlope = slope != null && String(slope).trim() !== "";
    if (hasRating !== hasSlope) return `${label} rating and slope must both be entered or blank.`;
    if (!hasRating) return null;
    const ratingValue = Number(rating);
    const slopeValue = Number(slope);
    if (!Number.isFinite(ratingValue) || ratingValue < minRating || ratingValue > maxRating) {
      return `${label} rating must be from ${minRating} to ${maxRating}.`;
    }
    if (!Number.isInteger(slopeValue) || slopeValue < 55 || slopeValue > 155) {
      return `${label} slope must be a whole number from 55 to 155.`;
    }
    return null;
  };

  for (const [teeIndex, tee] of tees.entries()) {
    if (!tee.name.trim()) return `Tee ${teeIndex + 1} needs a name.`;
    if (!tee.color.trim()) return `Tee ${teeIndex + 1} needs a color.`;
    if (!Number.isInteger(Number(tee.distance)) || Number(tee.distance) < 0 || Number(tee.distance) > 20000) {
      return `Tee ${teeIndex + 1} needs a whole-number total distance from 0 to 20000.`;
    }
    const normalizedName = tee.name.trim().toLowerCase();
    if (names.has(normalizedName)) return "Tee names must be unique within a course.";
    names.add(normalizedName);
    const scorecardError =
      validateScorecard(tee.holes, teeIndex, "Men's scorecard") ||
      validateScorecard(tee.holesWomen, teeIndex, "Women's scorecard");
    if (scorecardError) return scorecardError;
    const frontPar = tee.holes.slice(0, 9).reduce((total, hole) => total + Number(hole.par), 0);
    const backPar = holeCount === 18
      ? tee.holes.slice(9, 18).reduce((total, hole) => total + Number(hole.par), 0)
      : 0;
    if (
      Number(tee.par) !== frontPar + backPar ||
      Number(tee.frontPar) !== frontPar ||
      Number(tee.backPar) !== backPar
    ) {
      return `Tee ${teeIndex + 1} par and front/back par must match its men's scorecard.`;
    }
    const fullMin = holeCount === 9 ? 20 : 40;
    const fullMax = holeCount === 9 ? 50 : 100;
    const ratingError =
      validateRatingPair(tee.ratingMen, tee.slopeMen, `Tee ${teeIndex + 1} men's full-course`, fullMin, fullMax) ||
      validateRatingPair(tee.ratingWomen, tee.slopeWomen, `Tee ${teeIndex + 1} women's full-course`, fullMin, fullMax) ||
      validateRatingPair(tee.ratingFrontMen, tee.slopeFrontMen, `Tee ${teeIndex + 1} men's front-nine`, 20, 50) ||
      validateRatingPair(tee.ratingBackMen, tee.slopeBackMen, `Tee ${teeIndex + 1} men's back-nine`, 20, 50) ||
      validateRatingPair(tee.ratingFrontWomen, tee.slopeFrontWomen, `Tee ${teeIndex + 1} women's front-nine`, 20, 50) ||
      validateRatingPair(tee.ratingBackWomen, tee.slopeBackWomen, `Tee ${teeIndex + 1} women's back-nine`, 20, 50);
    if (ratingError) return ratingError;
  }

  return null;
};

const toTeePayload = (tee: TeeFormData): CourseTeePayload => ({
  ...(tee.id != null ? { id: tee.id } : {}),
  name: tee.name.trim(),
  color: tee.color.trim(),
  distance: Number(tee.distance || 0),
  par: Number(tee.par || 0),
  frontPar: Number(tee.frontPar || 0),
  backPar: Number(tee.backPar || 0),
  slopeMen: toNullableNumber(tee.slopeMen),
  slopeFrontMen: toNullableNumber(tee.slopeFrontMen),
  slopeBackMen: toNullableNumber(tee.slopeBackMen),
  slopeWomen: toNullableNumber(tee.slopeWomen),
  slopeFrontWomen: toNullableNumber(tee.slopeFrontWomen),
  slopeBackWomen: toNullableNumber(tee.slopeBackWomen),
  ratingMen: toNullableNumber(tee.ratingMen),
  ratingFrontMen: toNullableNumber(tee.ratingFrontMen),
  ratingBackMen: toNullableNumber(tee.ratingBackMen),
  ratingWomen: toNullableNumber(tee.ratingWomen),
  ratingFrontWomen: toNullableNumber(tee.ratingFrontWomen),
  ratingBackWomen: toNullableNumber(tee.ratingBackWomen),
  holes: tee.holes.map((hole) => ({
    num: hole.num,
    par: Number(hole.par),
    dis: Number(hole.dis),
    hcp: Number(hole.hcp),
  })),
  holesWomen: tee.holesWomen.map((hole) => ({
    num: hole.num,
    par: Number(hole.par),
    dis: Number(hole.dis),
    hcp: Number(hole.hcp),
  })),
});

export const toCoursePayload = (
  form: CourseFormData,
  tees: TeeFormData[]
): CoursePayload => ({
  clubId: Number(form.clubId),
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  location: form.location.trim() || undefined,
  phone: form.phone.trim() || undefined,
  timeZone: form.timeZone.trim(),
  accessType: form.accessType || "public",
  numHoles: form.numHoles ? Number(form.numHoles) : undefined,
  par: Number(form.par),
  externalProvider: form.externalProvider || null,
  externalId: form.externalId || null,
  scorecardUrl: form.scorecardUrl || null,
  usgaCourseId: toNullableNumber(form.usgaCourseId),
  tees: tees.map(toTeePayload),
});
