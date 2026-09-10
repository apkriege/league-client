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

export type ClubRecord = ClubPayload & {
  id: number;
};

export const getClubs = async () => {
  const response = await apiClient.get<ClubRecord[]>("/clubs");
  return response.data;
};

export const createClub = async (data: ClubPayload) => {
  const response = await apiClient.post<ClubRecord>("/clubs", data);
  return response.data;
};
