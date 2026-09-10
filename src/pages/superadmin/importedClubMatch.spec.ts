import { describe, expect, it } from "vitest";
import type { ClubRecord } from "@api/clubs";
import type { ImportedCourse } from "@api/courses";
import type { CourseRecord } from "./courseAdminForm";
import { findImportedClubMatches } from "./importedClubMatch";

const importedCourse = (clubName: string, location: string): ImportedCourse => ({
  provider: "GolfCourseAPI",
  externalId: "course-123",
  attribution: "Test",
  warnings: [],
  club: {
    name: clubName,
    description: "",
    location,
    phone: "",
    link: "",
    accessType: "public",
  },
  course: {
    name: "North Course",
    description: "",
    location,
    phone: "",
    accessType: "public",
    par: 72,
    numHoles: 18,
    tees: [],
    externalProvider: "GolfCourseAPI",
    externalId: "course-123",
    scorecardUrl: "",
  },
});

const clubs: ClubRecord[] = [
  { id: 1, name: "Sawmill Golf Club", location: "1 Golf Way" },
  { id: 2, name: "Sawmill Golf Club", location: "Lansing, MI" },
];

describe("findImportedClubMatch", () => {
  it("prefers the matching club city when names are duplicated", () => {
    const courses: CourseRecord[] = [
      { id: 10, clubId: 1, name: "South Course", location: "Saginaw, MI" },
    ];

    expect(
      findImportedClubMatches(
        clubs,
        courses,
        importedCourse("sawmill golf club", "Saginaw, MI"),
      )[0]?.id,
    ).toBe(1);
  });

  it("offers the sole name match when its stored address has no city", () => {
    expect(
      findImportedClubMatches(
        [clubs[0]],
        [],
        importedCourse("Sawmill Golf Club", "Saginaw, MI"),
      )[0]?.id,
    ).toBe(1);
  });

  it("returns every same-name option when the city is ambiguous", () => {
    expect(
      findImportedClubMatches(clubs, [], importedCourse("Sawmill Golf Club", "Bay City, MI")).map(
        (club) => club.id,
      ),
    ).toEqual([1, 2]);
  });
});
