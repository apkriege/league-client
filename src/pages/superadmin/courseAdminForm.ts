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
  slopeBackMen: count === 9 ? "0" : "",
  slopeWomen: "",
  slopeFrontWomen: "",
  slopeBackWomen: count === 9 ? "0" : "",
  ratingMen: "",
  ratingFrontMen: "",
  ratingBackMen: count === 9 ? "0" : "",
  ratingWomen: "",
  ratingFrontWomen: "",
  ratingBackWomen: count === 9 ? "0" : "",
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

  const coursePar = Number(form.par);
  if (Number.isNaN(coursePar) || coursePar <= 0) return "Par must be a positive number.";

  const holeCount = Number(form.numHoles);
  if (!holeCount || Number.isNaN(holeCount) || holeCount <= 0) {
    return "Number of holes must be a positive number.";
  }

  for (const [teeIndex, tee] of tees.entries()) {
    if (!tee.name.trim()) return `Tee ${teeIndex + 1} needs a name.`;
    if (!tee.color.trim()) return `Tee ${teeIndex + 1} needs a color.`;
    if (tee.holes.length !== holeCount) {
      return `Tee ${teeIndex + 1} must have ${holeCount} holes.`;
    }

    for (const hole of tee.holes) {
      if (Number.isNaN(Number(hole.par)) || Number(hole.par) <= 0) {
        return `Hole ${hole.num} on tee ${teeIndex + 1} needs a valid par.`;
      }
      if (Number.isNaN(Number(hole.dis)) || Number(hole.dis) < 0) {
        return `Hole ${hole.num} on tee ${teeIndex + 1} needs a valid distance.`;
      }
      if (Number.isNaN(Number(hole.hcp)) || Number(hole.hcp) <= 0) {
        return `Hole ${hole.num} on tee ${teeIndex + 1} needs a valid handicap rank.`;
      }
    }
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
  tees: tees.map(toTeePayload),
});
