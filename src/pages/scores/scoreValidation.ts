export function validateHoleScores({
  watchedPlayers,
  players,
  holes,
}: {
  watchedPlayers: any;
  players: any[];
  holes: any[];
}) {
  if (!Array.isArray(players) || players.length === 0) return "No players found for this flight.";
  if (!Array.isArray(holes) || holes.length === 0) return "No holes found for this event.";

  for (const entry of players) {
    const playerId = Number(entry?.playerId);
    const name = `${entry?.player?.firstName || "Player"} ${entry?.player?.lastName || ""}`.trim();
    const scores = watchedPlayers?.[playerId]?.scores;

    if (!Array.isArray(scores) || scores.length < holes.length) {
      return `${name} needs a score for every hole.`;
    }

    for (let index = 0; index < holes.length; index += 1) {
      const score = scores[index];
      const numericScore = Number(score);
      if (
        score === "" ||
        score == null ||
        !Number.isInteger(numericScore) ||
        numericScore < 1 ||
        numericScore > 30
      ) {
        return `${name} needs a valid score for hole ${holes[index]?.num ?? index + 1}.`;
      }
    }
  }

  return null;
}
