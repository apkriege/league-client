import type { AutocompleteOption } from "@/components/form/AutocompleteSelect";

type CourseOptionInput = {
  id: string | number;
  name?: string | null;
  location?: string | null;
  par?: number | string | null;
  numHoles?: number | string | null;
  club?: {
    name?: string | null;
    location?: string | null;
  } | null;
};

const alphabetical = new Intl.Collator(undefined, { sensitivity: "base" });
const getClubName = (course: CourseOptionInput) => course.club?.name || "Club unavailable";

export const createCourseAutocompleteOptions = (
  courses: CourseOptionInput[]
): AutocompleteOption[] =>
  [...courses]
    .sort((left, right) => {
      const clubComparison = alphabetical.compare(getClubName(left), getClubName(right));

      return clubComparison !== 0
        ? clubComparison
        : alphabetical.compare(String(left.name || ""), String(right.name || ""));
    })
    .map((course) => {
      const courseName = course.name || "Unnamed course";
      const clubName = getClubName(course);
      const location = course.location || course.club?.location || "Location unavailable";
      const par = course.par ?? "—";
      const holes = course.numHoles ?? "—";

      return {
        value: course.id,
        label: courseName,
        searchText: `${clubName} ${location}`,
        content: (
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-[11px] font-medium text-slate-800">
              {courseName}
            </span>
            <span className="block truncate text-[9px] text-gray-500">
              {clubName} · {location} · Par {par} · {holes} holes
            </span>
          </div>
        ),
      };
    });
