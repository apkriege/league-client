import type { ClubRecord } from "@api/clubs";
import type { ImportedCourse } from "@api/courses";
import type { CourseRecord } from "./courseAdminForm";

const normalizeText = (value: string | null | undefined) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const cityFromCourseLocation = (location: string | null | undefined) =>
  normalizeText(String(location || "").split(",")[0]);

const locationContainsCity = (location: string | null | undefined, city: string) => {
  if (!city) return false;
  const normalizedLocation = ` ${normalizeText(location)} `;
  return normalizedLocation.includes(` ${city} `);
};

export const findImportedClubMatches = (
  clubs: ClubRecord[],
  courses: CourseRecord[],
  imported: ImportedCourse,
) => {
  const importedName = normalizeText(imported.club.name);
  const importedCity = cityFromCourseLocation(imported.course.location);
  const nameMatches = clubs.filter((club) => normalizeText(club.name) === importedName);

  if (nameMatches.length === 0) return [];

  const cityMatches = nameMatches.filter((club) => {
    if (locationContainsCity(club.location, importedCity)) return true;
    return courses.some(
      (course) =>
        Number(course.clubId ?? course.club?.id) === Number(club.id) &&
        cityFromCourseLocation(course.location) === importedCity,
    );
  });

  return cityMatches.length > 0 ? cityMatches : nameMatches;
};
