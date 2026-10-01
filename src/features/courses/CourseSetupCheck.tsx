import { useState } from "react";
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
    <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Check your course</h2>
        <p className="mt-1 text-sm text-slate-500">Confirm your course is available before building your roster. You’ll select the course and tees when scheduling events.</p>
      </div>
      <CourseQueryState {...query} count={courses.length} onRetry={() => void query.refetch()} />
      {!query.isLoading && !query.isError && courses.length > 0 && <AutocompleteSelect label="Find your course" placeholder="Search course, club, or location" options={options} value={courseId} onChange={(value) => setCourseId(value ?? "")} noResultsText="No matching courses" />}
      {courseId && <p role="status" className="text-sm font-medium text-emerald-700">Course available. Continue with your league setup.</p>}
      <CourseRequestDialog />
      <p className="text-sm text-slate-500">You can continue setup while a course request is pending.</p>
    </section>
  );
}
