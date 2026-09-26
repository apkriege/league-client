import { useQuery } from "@tanstack/react-query";
import { getCourses, getCourseById, getPendingCourseRequests } from ".";

export const useCoursesWithTees = () => {
  return useQuery({
    queryKey: ["courses-with-tees"],
    queryFn: () => getCourses(true),
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });
};

export const usePendingCourseRequests = () =>
  useQuery({
    queryKey: ["course-requests", "pending"],
    queryFn: getPendingCourseRequests,
  });
