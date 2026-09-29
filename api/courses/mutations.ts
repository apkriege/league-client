import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCourse,
  deleteCourse,
  requestCourse,
  requestManualCourse,
  resolveCourseRequest,
  retryCourseRequestNotification,
  updateCourse,
} from ".";
import type { CoursePayload, ManualCourseRequest } from ".";

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CoursePayload) => {
      return await createCourse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-with-tees"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CoursePayload }) => {
      return await updateCourse(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-with-tees"] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCourse(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-with-tees"] });
    },
  });
};

export const useRequestCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ externalId, scorecardImage }: { externalId: string; scorecardImage?: File | null }) =>
      requestCourse(externalId, scorecardImage),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-requests", "mine"] }),
  });
};

export const useRequestManualCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ManualCourseRequest) => requestManualCourse(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-requests", "mine"] }),
  });
};

export const useResolveCourseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveCourseRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-requests", "pending"] }),
  });
};

export const useRetryCourseRequestNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryCourseRequestNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["course-requests", "pending"] }),
  });
};
