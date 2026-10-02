import Button from "@/components/layout/Button";
import { getApiErrorMessage } from "@/lib/apiError";

type Props = { isLoading: boolean; isError: boolean; error: unknown; count: number; onRetry: () => void };

export default function CourseQueryState({ isLoading, isError, error, count, onRetry }: Props) {
  if (!isLoading && !isError && count > 0) return null;
  return (
    <div role={isError ? "alert" : "status"} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-bold text-slate-900">{isLoading ? "Loading courses…" : isError ? "Unable to load courses" : "No courses available yet"}</p>
      {!isLoading && <p className="mt-1 text-xs text-slate-500">{isError ? getApiErrorMessage(error, "Please try again.") : "Request your course to prepare for your first event."}</p>}
      {isError && <Button type="button" className="mt-2" variant="default" onClick={onRetry}>Retry loading courses</Button>}
    </div>
  );
}
