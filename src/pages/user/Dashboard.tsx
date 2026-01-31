import Card from "@/components/layout/Card";
import ComparisonBarChart from "@/components/charts/ComparisonBarChart";
import {
  useLeagueLeaderboards,
  useLeagueStats,
  usePlayerEvents,
  usePlayerStats,
} from "@api/dashboard/queries";
import dayjs from "dayjs";
import { useAppStore } from "@/stores/appStore";
import { useUserLeagues } from "@api/users/queries";

const TeamsLayout = ({ teams }: any) => {
  const team1 = teams[0];
  const team2 = teams[1];

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold">
          <span className="text-red-600">#{team1.seasonRank}</span> - {team1.name}
        </h2>
        {team1.players.map((p: any) => (
          <p key={p.id} className="text-xs">
            {p.firstName} {p.lastName} ({p.handicap})
          </p>
        ))}
      </div>
      <div>vs</div>
      <div>
        <h2 className="text-sm font-semibold">
          <span className="text-red-600">#{team2.seasonRank}</span> - {team2.name}
        </h2>
        {team2.players.map((p: any) => (
          <p key={p.id} className="text-xs">
            {p.firstName} {p.lastName} ({p.handicap})
          </p>
        ))}
      </div>
    </div>
  );
};

const PlayersLayout = ({ players }: any) => {
  return (
    <div className="flex flex-col gap-4">
      {players.map((player: any) => (
        <div key={player.id} className="p-4 border border-base-content/10 rounded-md">
          <h2 className="text-lg font-semibold mb-2">
            {player.firstName} {player.lastName} (Handicap: {player.handicap})
          </h2>
        </div>
      ))}
    </div>
  );
};

const FlightCard = ({ flight }: any) => {
  console.log("Flight in Card:", flight);

  const evType = flight.event.type;
  const time = dayjs(flight.startTime, "H:mm").format("h:mm A");
  const date = dayjs(flight.event.date).format("MMM D, YYYY");

  return (
    <div className="card-body p-4">
      <div className="flex justify-between mb-2 w-full">
        <div className="card-title text-sm">{flight.event.name}</div>
        <div className="text-xs italic">
          {date} - {time}
        </div>
      </div>
      {evType === "team" ? (
        <TeamsLayout teams={flight.teams.map((t: any) => t.team)} />
      ) : (
        <PlayersLayout players={flight.players.map((p: any) => p.player)} />
      )}
    </div>
  );
};

const SelectLeague = ({ userId }: any) => {
  const { user, setLeagueId, setPlayerId } = useAppStore();
  const { data: leagues } = useUserLeagues(userId || 0);

  const setLeague = (leagueId: number) => {
    const playerId = user.leagues.find((ul: any) => ul.id === leagueId)?.playerId;

    if (leagueId && playerId) {
      setLeagueId(leagueId);
      setPlayerId(playerId);
    } else {
      console.error("Failed to set league or player ID");
    }
  };

  if (leagues && leagues.length > 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Select a League</h1>
        <div className="flex flex-col gap-3">
          {leagues.map((league: any) => (
            <button key={league.id} className="mb-2 text-left">
              <div
                className="card bg-base-200 shadow-md border border-base-content/10 p-4 w-full text-left"
                onClick={() => setLeague(league.id)}
              >
                <h2 className="text-lg font-semibold">{league.name}</h2>
                <p className="text-sm italic">Season: {league.season}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Select a League</h1>
      <p>
        You are not currently a member of any leagues. Please join or create a league to continue.
      </p>
    </div>
  );
};

export default function Dashboard() {
  const { user, playerId, leagueId } = useAppStore();
  console.log("Dashboard leagueId:", leagueId);

  // const { data: events } = usePlayerEvents(leagueId, playerId);
  const events = undefined;
  const { data: playerStats } = usePlayerStats(leagueId, playerId);
  const { data: leagueStats } = useLeagueStats(leagueId, playerId);
  const { data: leaderboards } = useLeagueLeaderboards(leagueId);

  if (!leagueId) {
    return <SelectLeague userId={user?.id} />;
  }

  // if (!events || !playerStats || !leagueStats || !leaderboards) {
  if (!playerStats || !leagueStats || !leaderboards) {
    return <div>Loading...</div>;
  }

  // console.log("Events:", events);
  // console.log("Player Stats:", playerStats);
  // console.log("League Stats:", leagueStats);
  // console.log("Leaderboards:", leaderboards);

  const pStats = playerStats.stats.totals;
  const lStats = leagueStats.stats.totals;
  const numEvents = playerStats.stats.totalEvents;

  const playerAvgs = {
    eagles: (pStats.eagles / numEvents).toFixed(2),
    birdies: (pStats.birdies / numEvents).toFixed(2),
    pars: (pStats.pars / numEvents).toFixed(2),
    bogeys: (pStats.bogeys / numEvents).toFixed(2),
    doubleBogeys: (pStats.doubleBogeys / numEvents).toFixed(2),
  };

  const leagueAvgs = {
    eagles: (lStats.eagles / numEvents).toFixed(2),
    birdies: (lStats.birdies / numEvents).toFixed(2),
    pars: (lStats.pars / numEvents).toFixed(2),
    bogeys: (lStats.bogeys / numEvents).toFixed(2),
    doubleBogeys: (lStats.doubleBogeys / numEvents).toFixed(2),
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>
    </div>
  );
}

// <div>
//       <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>

//       <section className="mb-8 w-full">
//         <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {events.flights.map((flight: any) => (
//             <div
//               key={flight.id}
//               className="card bg-base-200 shadow-md border border-base-content/10"
//             >
//               <FlightCard flight={flight} />
//             </div>
//           ))}
//         </div>
//       </section>

//       <section className="mb-8">
//         <h3 className="text-xl font-semibold mb-4">Stats Comparison</h3>
//         <Card className="p-2! w-1/2!">
//           <ComparisonBarChart
//             playerData={playerAvgs}
//             leagueData={leagueAvgs}
//             playerLabel="Your Averages"
//             leagueLabel="League Averages"
//             title="Averages per Round"
//             height={200}
//             padding={0}
//           />
//         </Card>
//       </section>

//       <section className="grid grid-cols-3 gap-4 mb-8">
//         <h3 className="col-span-3 text-xl font-semibold">Leaderboards</h3>
//         <Card className="col-span-1 p-4">
//           <h2 className="text-sm font-semibold mb-2">Top 5 Players</h2>
//           {leaderboards.topPlayers.map((player: any, index: number) => (
//             <p
//               key={player.playerId}
//               className={`flex px-0! py-2! justify-between w-full text-sm ${
//                 index !== leaderboards.topPlayers.length - 1 && "border-b border-base-content/20"
//               }`}
//             >
//               <span className="">{player.name}</span>
//               <span className="italic">{player.points} pts</span>
//             </p>
//           ))}
//         </Card>
//         <Card className="col-span-1 p-4">
//           <h2 className="text-sm font-semibold mb-2">Top 5 Teams</h2>
//           {leaderboards.topTeams.map((team: any, index: number) => (
//             <p
//               key={team.teamId}
//               className={`flex px-0! py-2! justify-between w-full text-sm ${
//                 index !== leaderboards.topTeams.length - 1 && "border-b border-base-content/20"
//               }`}
//             >
//               <span className="">{team.name}</span>
//               <span className="italic">{team.points} pts</span>
//             </p>
//           ))}
//         </Card>
//         <Card className="col-span-1 p-4">
//           <h2 className="text-sm font-semibold mb-2">Lowest Handicaps</h2>
//           {leaderboards.topHandicaps.map((player: any, index: number) => (
//             <p
//               key={player.playerId}
//               className={`flex px-0! py-2! justify-between w-full text-sm ${
//                 index !== leaderboards.topHandicaps.length - 1 && "border-b border-base-content/20"
//               }`}
//             >
//               <span className="">{player.name}</span>
//               <span className="italic">{player.handicap}</span>
//             </p>
//           ))}
//         </Card>
//       </section>
//     </div>
