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
  slopeMen: number | null;
  slopeFrontMen: number | null;
  slopeBackMen: number | null;
  slopeWomen?: number | null;
  slopeFrontWomen?: number | null;
  slopeBackWomen?: number | null;
  ratingMen: number | null;
  ratingFrontMen: number | null;
  ratingBackMen: number | null;
  ratingWomen?: number | null;
  ratingFrontWomen?: number | null;
  ratingBackWomen?: number | null;
  holes: CourseHolePayload[];
  holesWomen: CourseHolePayload[];
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
  externalProvider?: string | null;
  externalId?: string | null;
  scorecardUrl?: string | null;
  usgaCourseId?: number | null;
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
  maleTeeCount: number;
  femaleTeeCount: number;
  alreadyImported?: boolean;
  availabilityUnchecked?: boolean;
};

export type ImportedCourse = {
  provider: "GolfCourseAPI";
  externalId: string;
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
    externalProvider: "GolfCourseAPI";
    externalId: string;
    scorecardUrl: string;
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

export type UsgaRatingLookup = {
  courseId: number;
  sourceUrl: string;
  tableText: string;
};

export const getUsgaRatingTable = async (courseId: number): Promise<UsgaRatingLookup> => {
  const response = await apiClient.get<UsgaRatingLookup>(
    `/courses/usga/${courseId}/ratings`,
    { timeout: 15_000 },
  );
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

export const searchCourseDirectory = async (name: string, state?: string) => {
  const response = await apiClient.get<{
    results: CourseImportSearchResult[];
    attribution: string;
  }>("/courses/import/search", {
    params: { name, state: state || undefined },
  });
  return response.data;
};

export type StateCourseSearchResponse = {
  results: CourseImportSearchResult[];
  attribution: string;
  offset: number;
  checked: number;
  unavailable: number;
  total: number;
  hasMore: boolean;
  nextOffset: number;
};

export const searchStateCourseDirectory = async (state: string, offset = 0) => {
  const response = await apiClient.get<StateCourseSearchResponse>("/courses/import/state", {
    params: { state, offset },
    timeout: 120000,
  });
  return response.data;
};

export const loadCourseImport = async (externalId: string) => {
  const response = await apiClient.get<ImportedCourse>(
    `/courses/import/${encodeURIComponent(externalId)}`
  );
  return response.data;
};

const buildCourseRequestForm = (fields: Record<string, string>, scorecardImage?: File | null) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  if (scorecardImage) form.append("scorecardImage", scorecardImage);
  return form;
};

export const requestCourse = async (externalId: string, scorecardImage?: File | null) => {
  const response = await apiClient.upload<{ message: string }>(
    "/courses/requests",
    buildCourseRequestForm({ externalId }, scorecardImage)
  );
  return response.data;
};

export type ManualCourseRequest = {
  courseName: string;
  city: string;
  state: string;
  scorecardImage?: File | null;
};

export const requestManualCourse = async (request: ManualCourseRequest) => {
  const { scorecardImage, ...fields } = request;
  const response = await apiClient.upload<{ message: string }>(
    "/courses/requests/manual",
    buildCourseRequestForm(fields, scorecardImage)
  );
  return response.data;
};

export type CourseRequest = {
  id: number;
  requestType: "directory" | "manual";
  courseName: string;
  location: string;
  externalId: string | null;
  status: "pending" | "resolved";
  createdAt: string;
  requester: { id: number; firstName: string; lastName: string; email: string };
};

export const getPendingCourseRequests = async () => {
  const response = await apiClient.get<CourseRequest[]>("/courses/requests/pending");
  return response.data;
};

export const resolveCourseRequest = async (id: number) => {
  const response = await apiClient.patch<CourseRequest>(`/courses/requests/${id}/resolve`);
  return response.data;
};
