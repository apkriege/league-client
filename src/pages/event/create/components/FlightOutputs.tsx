export const FlightStrokeOutput = ({ players, playerIds }: any) => {
  const playerElements = playerIds.map((id: any) => {
    const player = players.find((p: any) => p.id === id);
    if (!player) return <div key={id}>Unknown Player</div>;
    return (
      <div key={id} className="flex items-center">
        <p className="font-medium text-[11px]">
          {player.firstName[0]} {player.lastName} ({player.handicap})
        </p>
      </div>
    );
  });

  return <div>{playerElements}</div>;
};

export const FlightMatchOutput = ({ players, matchups }: any) => {
  const matchupElements = matchups.map((pair: any, idx: number) => {
    const player1 = players.find((p: any) => p.id === pair[0]);
    const player2 = players.find((p: any) => p.id === pair[1]);

    return (
      <div key={idx} className="flex items-center gap-1 justify-between">
        <div className="font-medium text-[11px]">
          {player1 ? `${player1.firstName[0]} ${player1.lastName}` : "Unknown Player"}
        </div>
        <span className="text-[10px] text-base-content/50">vs</span>
        <div className="font-medium text-[11px]">
          {player2 ? `${player2.firstName[0]} ${player2.lastName}` : "Unknown Player"}
        </div>
      </div>
    );
  });

  return <div>{matchupElements}</div>;
};

export const FlightTeamOutput = ({ players, teams, matchups }: any) => {
  const team1 = teams.find((t: any) => t.id === matchups[0]?.id || t.id == matchups[0]);
  const team2 = teams.find((t: any) => t.id === matchups[1]?.id || t.id == matchups[1]);

  const playersLayout = (team: any) => {
    if (!team) return null;

    const rosterIds = (team.players || []).map((p: any) => (typeof p === "object" ? p.id : p));
    const player1 = players.find((p: any) => p.id === rosterIds[0]);
    const player2 = players.find((p: any) => p.id === rosterIds[1]);

    if (!player1 || !player2) {
      return (
        <div className="text-xs italic text-red-500">
          {`Missing player data for team ${team.name}`}
        </div>
      );
    }

    return [player1, player2].map((p: any) => (
      <div key={p.id} className="flex items-center">
        <div className="font-medium text-[11px] italic">
          {p.firstName[0]}. {p.lastName} ({p.handicap})
        </div>
      </div>
    ));
  };

  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="font-medium text-xs">
        {team1 ? (
          <div>
            <div className="font-semibold">{team1.name}</div>
            <div>{playersLayout(team1)}</div>
          </div>
        ) : (
          "Unknown Team"
        )}
      </div>
      <span className="text-xs">vs</span>
      <div className="font-medium text-xs">
        {team2 ? (
          <div>
            <div className="font-semibold">{team2.name}</div>
            <div>{playersLayout(team2)}</div>
          </div>
        ) : (
          "Unknown Team"
        )}
      </div>
    </div>
  );
};
