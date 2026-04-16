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

// graph for handicap, gross, net
// upcoming schedule with opponents (if team event, show team members)
// league stats cards
// leader booards for top players, teams, and handicaps
//

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

      <section className="grid grid-cols-3 gap-4">
        <div className="flex flex-col col-span-2 gap-2">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="bg-green-500 h-64"></div>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Upcoming</h2>
          <div className="flex-1 bg-green-500"></div>
          <div className="flex-1 bg-green-500"></div>
          <div className="flex-1 bg-green-500"></div>
        </div>
      </section>

      <section className="my-8">
        {/* <h2 className="text-lg font-semibold">Leaderboards</h2> */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Last Event Stats</h3>
            <div className="bg-green-500 h-[200px]"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Season Stats</h3>
            <div className="bg-green-500 h-[200px]"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Total Stats</h3>
            <div className="bg-green-500 h-[200px]"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
