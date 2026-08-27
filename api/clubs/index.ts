import apiClient from "../client";
export * from "./queries";
export * from "./mutations";

export type ClubPayload = {
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  link?: string;
  accessType?: string;
};

export const getClubs = async () => {
  const response = await apiClient.get("/clubs");
  return response.data;
};

export const createClub = async (data: ClubPayload) => {
  const response = await apiClient.post("/clubs", data);
  return response.data;
};
