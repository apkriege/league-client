export function ScoreDraftStatus({
  hasDraft,
  storageError = false,
  savedAt,
  onClear,
  submitLabel = "Submit Scores",
}: {
  hasDraft: boolean;
  storageError?: boolean;
  savedAt: string | null;
  onClear: () => void;
  submitLabel?: "Submit Scores" | "Save Changes";
}) {
  if (storageError) return <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Draft storage is unavailable. Keep this page open and use {submitLabel} to save to your league.</p>;
  if (!hasDraft) return null;

  return (
    <div role="status" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          Draft saved on this device
          {savedAt
            ? ` at ${new Date(savedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`
            : ""}
          . Use {submitLabel} to save to your league.
        </span>
        <button type="button" onClick={onClear} className="font-black underline">
          Clear draft
        </button>
      </div>
    </div>
  );
}
