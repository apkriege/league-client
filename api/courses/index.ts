import apiClient from "../client";
export * from "./queries";
export * from "./mutations";

export type CourseHolePayload = {
  num: number;
  par: number;
  dis: number;
  hcp: number;
};

export type CourseTeePayload = {
  id?: number;
  name: string;
  color: string;
  distance: number;
  par: number;
  frontPar: number;
  backPar: number;
  slopeMen: number;
  slopeFrontMen: number;
  slopeBackMen: number;
  slopeWomen?: number | null;
  slopeFrontWomen?: number | null;
  slopeBackWomen?: number | null;
  ratingMen: number;
  ratingFrontMen: number;
  ratingBackMen: number;
  ratingWomen?: number | null;
  ratingFrontWomen?: number | null;
  ratingBackWomen?: number | null;
  holes: CourseHolePayload[];
};

export type CoursePayload = {
  clubId: number;
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  timeZone: string;
  accessType: string;
  numHoles?: number;
  par: number;
  tees?: CourseTeePayload[];
};

export type CourseImportSearchResult = {
  externalId: string;
  clubName: string;
  courseName: string;
  city: string;
  state: string;
  location: string;
  accessType: "public" | "private";
  par: number | null;
  phone: string;
  website: string;
};

export type ImportedCourse = {
  provider: "OpenGolfAPI";
  attribution: string;
  warnings: string[];
  club: {
    name: string;
    description: string;
    location: string;
    phone: string;
    link: string;
    accessType: "public" | "private";
  };
  course: {
    name: string;
    description: string;
    location: string;
    phone: string;
    timeZone?: string;
    accessType: "public" | "private";
    par: number;
    numHoles: number;
    tees: CourseTeePayload[];
  };
};

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

export const createCourse = async (data: CoursePayload) => {
  const response = await apiClient.post("/courses", data);
  return response.data;
};

export const updateCourse = async (id: number, data: CoursePayload) => {
  const response = await apiClient.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: number) => {
  const response = await apiClient.delete(`/courses/${id}`);
  return response.data;
};

export const searchCourseDirectory = async (name: string) => {
  const response = await apiClient.get<{
    results: CourseImportSearchResult[];
    attribution: string;
  }>("/courses/import/search", {
    params: { name },
  });
  return response.data;
};

export const loadCourseImport = async (externalId: string) => {
  const response = await apiClient.get<ImportedCourse>(
    `/courses/import/${encodeURIComponent(externalId)}`
  );
  return response.data;
};

export const requestCourse = async (externalId: string) => {
  const response = await apiClient.post<{ message: string }>("/courses/requests", {
    externalId,
  });
  return response.data;
};

export type ManualCourseRequest = {
  courseName: string;
  city: string;
  state: string;
};

export const requestManualCourse = async (request: ManualCourseRequest) => {
  const response = await apiClient.post<{ message: string }>("/courses/requests/manual", request);
  return response.data;
};
