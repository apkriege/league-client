export function isSubPlayer(player: any) {
  const type = String(player?.type || "").toLowerCase();
  return type === "sub" || type === "substitute";
}

export function sortPlayersByName(players: any[]) {
  return [...players].sort((left, right) =>
    `${left?.firstName || ""} ${left?.lastName || ""}`.localeCompare(
      `${right?.firstName || ""} ${right?.lastName || ""}`,
    ),
  );
}

export function buildSwappedPlayerEntry(baseEntry: any, replacement: any) {
  return {
    ...baseEntry,
    playerId: Number(replacement.id),
    courseHandicap: replacement?.courseHandicap ?? null,
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
