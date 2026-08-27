export function ScoreDraftStatus({
  hasDraft,
  savedAt,
  onClear,
}: {
  hasDraft: boolean;
  savedAt: string | null;
  onClear: () => void;
}) {
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
