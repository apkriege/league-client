import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCourse,
  deleteCourse,
  requestCourse,
  requestManualCourse,
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

export const useRequestCourse = () =>
  useMutation({
    mutationFn: (externalId: string) => requestCourse(externalId),
  });

export const useRequestManualCourse = () =>
  useMutation({
    mutationFn: (request: ManualCourseRequest) => requestManualCourse(request),
  });
