export type ApiLikeError = {
  message?: string;
  status?: number;
  errors?: unknown;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;
  return Number((error as ApiLikeError).status) || undefined;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
) => {
  if (!error || typeof error !== "object") return fallback;
  return (error as ApiLikeError).message || fallback;
};
