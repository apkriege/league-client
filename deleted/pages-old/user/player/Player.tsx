import { usePlayer } from "@api/players/queries";
import { useParams } from "react-router";
import { TrendingUp, TrendingDown } from "lucide-react";
import History from "./History";
import { useState } from "react";

export default function Player() {
  const { playerId } = useParams();
  const { data: player, isLoading, error } = usePlayer(Number(playerId));
  const [activeTab, setActiveTab] = useState("history");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !player) {
    return <div>Error loading player data</div>;
  }

  console.log("Player data:", player);

  const latestRound = player.rounds[player.rounds.length - 1];
  const previousRound = player.rounds[player.rounds.length - 2];
  const hcpIcon =
    latestRound < previousRound ? (
      <TrendingUp className="text-red-500" />
    ) : (
      <TrendingDown className="text-green-500" />
    );

  return (
    <div>
      <div className="top flex justify-between">
        <div className="flex mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-300 mr-6 justify-center items-center flex">
            <p className="text-2xl">
              {player.firstName[0]}
              {player.lastName[0]}
            </p>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">
              {player.firstName} {player.lastName}
            </h1>
            <p className="text-sm">Handicap: {player.handicap}</p>
          </div>
        </div>
        <div className="border rounded-lg px-4 py-2 h-fit">
          <p className="text-xs font-bold">Handicap</p>
          <div className="flex gap-2">
            <p className="text-2xl font-bold">{player.handicap}</p>
            {hcpIcon}
          </div>
        </div>
      </div>
      <div role="tablist" className="tabs tabs-border">
        <a
          role="tab"
          className={`tab ${activeTab === "history" && "tab-active"}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === "stats" && "tab-active"}`}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === "achievements" && "tab-active"}`}
          onClick={() => setActiveTab("achievements")}
        >
          Achievements
        </a>
      </div>
      <div className="mt-4 px-2">
        {activeTab === "history" && <History rounds={player.rounds} />}
        {activeTab === "stats" && <div>Stats content goes here</div>}
        {activeTab === "achievements" && <div>Achievements content goes here</div>}
      </div>
    </div>
  );
}
