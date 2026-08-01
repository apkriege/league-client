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

export function isSubPlayer(player: any) {
  const type = String(player?.type || "").toLowerCase();
  return type === "sub" || type === "substitute";
}

export function sortPlayersByName(players: any[]) {
  return [...players].sort((left, right) =>
    `${left?.firstName || ""} ${left?.lastName || ""}`.localeCompare(
      `${right?.firstName || ""} ${right?.lastName || ""}`
    )
  );
}

export function buildSwappedPlayerEntry(baseEntry: any, replacement: any) {
  return {
    ...baseEntry,
    playerId: Number(replacement.id),
    teamId: baseEntry?.teamId ?? replacement?.teamId ?? null,
    player: {
      ...baseEntry?.player,
      ...replacement,
      id: Number(replacement.id),
      rounds: [],
    },
  };
}

export function getSwapCandidates({
  currentEntry,
  leaguePlayers,
  eventPlayerIds,
  activePlayerIds = [],
  teamOnly = false,
}: {
  currentEntry: any;
  leaguePlayers: any[];
  eventPlayerIds: number[];
  activePlayerIds?: number[];
  teamOnly?: boolean;
}) {
  const currentId = Number(currentEntry?.playerId);
  const currentTeamId = Number(currentEntry?.teamId ?? currentEntry?.player?.teamId ?? 0);
  const eventIds = new Set((eventPlayerIds || []).map((id) => Number(id)));
  const activeIds = new Set((activePlayerIds || []).map((id) => Number(id)));
  const unique = new Map<number, any>();

  if (currentEntry?.player) {
    unique.set(currentId, { ...currentEntry.player, id: currentId });
  }

  for (const player of leaguePlayers || []) {
    const candidateId = Number(player?.id);
    if (!candidateId) continue;

    const isCurrent = candidateId === currentId;
    if (!isCurrent && activeIds.has(candidateId)) continue;

    const isAvailableSub = isSubPlayer(player);
    const isOutsideEvent = !eventIds.has(candidateId);
    const isSameTeam = Number(player?.teamId ?? 0) === currentTeamId;

    if (isCurrent || (isAvailableSub && candidateId !== currentId)) {
      unique.set(candidateId, player);
      continue;
    }

    if (teamOnly && isSameTeam && isOutsideEvent) {
      unique.set(candidateId, player);
      continue;
    }

    if (!teamOnly && isOutsideEvent) {
      unique.set(candidateId, player);
    }
  }

  return sortPlayersByName(Array.from(unique.values()));
}
