import apiClient from "../client";

export type SupportCategory = "question" | "bug" | "feedback" | "billing" | "other";

export type SupportMessageInput = {
  category: SupportCategory;
  subject: string;
  message: string;
};

export async function sendSupportMessage(input: SupportMessageInput) {
  const response = await apiClient.post<{ message: string }>("/support/messages", input);
  return response.data;
}
