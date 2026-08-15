import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type PlayerSwapControlProps = {
  currentPlayerId: number;
  candidates: any[];
  isSaving?: boolean;
  onSwap: (replacementId: number) => Promise<void> | void;
};

export function PlayerSwapControl({
  currentPlayerId,
  candidates,
  isSaving,
  onSwap,
}: PlayerSwapControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [replacementId, setReplacementId] = useState(currentPlayerId);

  const reset = () => {
    setIsOpen(false);
    setReplacementId(currentPlayerId);
  };

  return (
    <div className="inline-block">
      {!isOpen ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-900 hover:underline"
          onClick={() => {
            setReplacementId(currentPlayerId);
            setIsOpen(true);
          }}
        >
          <ArrowLeftRight size={10} />
          Swap
        </button>
      ) : (
        <div className="flex flex-col gap-1.5">
          <select
            className="h-7 min-w-36 rounded border border-gray-200 bg-white px-2 text-[10px]"
            value={replacementId}
            disabled={isSaving}
            onChange={(event) => setReplacementId(Number(event.target.value))}
          >
            {candidates.map((candidate: any) => {
              const type = String(candidate?.type || "").toLowerCase();
              const isSub = type === "sub" || type === "substitute";
              return (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.firstName} {candidate.lastName}
                  {isSub ? " - Sub" : ""}
                </option>
              );
            })}
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="h-6 rounded bg-slate-900 px-2 text-[10px] font-semibold text-white disabled:opacity-60"
              disabled={isSaving || !replacementId}
              onClick={async () => {
                await onSwap(replacementId);
                reset();
              }}
            >
              {isSaving ? "Saving" : "Save"}
            </button>
            <button
              type="button"
              className="h-6 rounded border border-gray-200 px-2 text-[10px] font-semibold text-gray-600"
              disabled={isSaving}
              onClick={reset}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
