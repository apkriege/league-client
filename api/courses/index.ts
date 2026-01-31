import apiClient from "../client";
export * from "./queries";

// add params for relations, filters, pagination, etc. as needed
export const getCourses = async (withTees: boolean) => {
  const response = await apiClient.get("/courses", {
    params: { withTees },
  });

  return response.data;
};

export const getCourseById = async (courseId: string) => {
  const response = await apiClient.get(`/courses/${courseId}`);
  return response.data;
};

export const searchCourses = async (query: string) => {
  const response = await apiClient.get("/courses/search", {
    params: { q: query },
  });
  return response.data;
};
