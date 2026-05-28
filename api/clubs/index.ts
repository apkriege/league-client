import apiClient from "../client";
export * from "./queries";

export const getClubs = async () => {
  const response = await apiClient.get("/clubs");
  return response.data;
};
