type PlayerRoundViewRowProps = {
  player: any;
  holes: any[];
  scoresByPlayer: any;
  roundedHandicap: (player: any) => number;
  popsForHole: (playerId: number, holeNum: number) => number;
  totalScore: (player: any) => number;
  getPlayerPoints: (player: any) => number;
  formatPoints: (value: number) => string;
};

export default function PlayerRoundViewRow({
  player,
  holes,
  scoresByPlayer,
  roundedHandicap,
  popsForHole,
  totalScore,
  getPlayerPoints,
  formatPoints,
}: PlayerRoundViewRowProps) {
  const p = player.player;

  return (
    <tr key={player.playerId} className="text-sm bg-slate-50/50">
      <td className="p-2 text-xs flex flex-col">
        <span className="font-semibold">
          {p.firstName} {p.lastName}
        </span>
        <span className="text-[10px]">Handicap: {roundedHandicap(player)}</span>
      </td>
      {holes.map((hole: any, holeIdx: number) => {
        const score = scoresByPlayer?.[player.playerId]?.scores?.[holeIdx];
        return (
          <td key={hole.num} className="p-2">
            <div className="relative h-8 border rounded flex items-center justify-center text-xs font-semibold bg-white">
              {score ?? "-"}
              {popsForHole(player.playerId, hole.num) > 0 && (
                <span className="absolute bottom-1 left-1 pointer-events-none flex items-center justify-center gap-0.5">
                  {Array.from({ length: popsForHole(player.playerId, hole.num) }).map((_, idx) => (
                    <span key={idx} className="h-1 w-1 rounded-full bg-black" />
                  ))}
                </span>
              )}
            </div>
          </td>
        );
      })}
      <td className="font-bold text-center text-xs">{totalScore(player)}</td>
      <td className="font-bold text-center text-xs">
        {totalScore(player) - roundedHandicap(player)}
      </td>
      <td className="font-bold text-center text-xs">{formatPoints(getPlayerPoints(player))}</td>
    </tr>
  );
}
