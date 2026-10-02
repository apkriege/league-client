import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCoursesWithTees } from "@api/courses/queries";
import AutocompleteSelect from "@/components/form/AutocompleteSelect";
import CourseQueryState from "./CourseQueryState";
import CourseRequestDialog from "./CourseRequestDialog";

export default function CourseSetupCheck() {
  const query = useCoursesWithTees();
  const [courseId, setCourseId] = useState<string | number>("");
  const courses = query.data ?? [];
  const options = courses.map((course: { id: number; name: string; club?: { name?: string; location?: string } }) => ({
    value: course.id, label: [course.name, course.club?.name, course.club?.location].filter(Boolean).join(" · "),
  }));
  return (
    <section aria-label="Course availability" className="mt-4 flex flex-col items-start sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <details className="group w-full min-w-0 sm:w-auto sm:flex-1">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-xs font-bold text-slate-700 sm:min-h-8">
          <ChevronDown size={14} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          Check your course
          <span className="font-medium text-slate-400">Optional</span>
        </summary>
        <div className="mt-3 max-w-xl space-y-3">
          <p className="text-xs text-slate-500">Choose courses and tees when scheduling events. Requests can stay pending while you finish setup.</p>
          <CourseQueryState {...query} count={courses.length} onRetry={() => void query.refetch()} />
          {!query.isLoading && !query.isError && courses.length > 0 && <AutocompleteSelect label="Find your course" placeholder="Search course, club, or location" options={options} value={courseId} onChange={(value) => setCourseId(value ?? "")} noResultsText="No matching courses" />}
          {courseId && <p role="status" className="text-xs font-medium text-emerald-700">Course available. Continue with your league setup.</p>}
        </div>
      </details>
      <CourseRequestDialog />
    </section>
  );
}
