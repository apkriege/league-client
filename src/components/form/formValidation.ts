export type ValidationIssue = { field: string; message: string };

export function getFieldError(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("message" in error)) return undefined;
  return typeof error.message === "string" ? error.message : undefined;
}
