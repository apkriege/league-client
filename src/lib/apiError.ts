export type ApiLikeError = {
  message?: string;
  code?: string;
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

export const isTrialEventLimitError = (error: unknown): boolean =>
  getApiErrorStatus(error) === 402 && typeof error === "object" && error !== null &&
  "code" in error && error.code === "TRIAL_EVENT_LIMIT";
