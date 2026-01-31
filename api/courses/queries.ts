import { useQuery } from "@tanstack/react-query";
import { getCourses, getCourseById } from ".";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(false),
  });
};

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
