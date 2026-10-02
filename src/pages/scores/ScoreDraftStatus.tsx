export function ScoreDraftStatus({
  hasDraft,
  storageError = false,
  savedAt,
  onClear,
}: {
  hasDraft: boolean;
  storageError?: boolean;
  savedAt: string | null;
  onClear: () => void;
}) {
  if (storageError) return <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Draft storage is unavailable. Keep this page open until your scores are saved.</p>;
  if (!hasDraft) return null;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          Draft autosaved
          {savedAt
            ? ` at ${new Date(savedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`
            : ""}
          .
        </span>
        <button type="button" onClick={onClear} className="font-black underline">
          Clear draft
        </button>
      </div>
    </div>
  );
}
