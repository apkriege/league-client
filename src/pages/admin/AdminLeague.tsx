import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLeague } from "@api/league/queries";
import { useLeagueStore } from "@/stores/leagueStore";

import Tabs from "@/components/layout/Tabs";
import Events from "@/features/admin-league/Events";
import Info from "@/features/admin-league/Info";
import Players from "@/features/admin-league/Players";
import Teams from "@/features/admin-league/Teams";
import Card from "@/components/layout/Card";

interface LeagueType {
  id: number;
  name: string;
  description: string;
  type: string;
  numPlayers: number;
  startDate: Date;
  endDate: Date;
  contactFirst: string;
  contactLast: string;
  contactEmail: string;
  contactPhone: string;
}

export default function League() {
  const params = useParams();
  const { setLeague } = useLeagueStore();
  const { data: league, isLoading } = useLeague(Number(params.leagueId));
  const [activeTab, setActiveTab] = useState("events");

  console.log("League data:", league);

  useEffect(() => {
    if (league) {
      setLeague(league);
    }
  }, [league, setLeague]);

  const tabs = [
    // { id: "info", label: "Info" },
    { id: "events", label: "Events" },
    { id: "players", label: "Players" },
    { id: "teams", label: "Teams" },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!league) {
    return <div>League not found</div>;
  }

  return (
    <div className="flex flex-col">
      <Card>
        <div className="header">
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <p className="text-sm">{league.description}</p>
        </div>
        <div className="grid grid-cols-3">
          <div className="flex flex-col">
            <p>Type: {league.type}</p>
            <p>Number of Players: {league.numPlayers}</p>
          </div>
          <div className="flex flex-col"></div>
          <div className="flex flex-col"></div>
        </div>
      </Card>
      <div className="mt-4">
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
      </div>
      <div className="mt-4">
        {/* {activeTab === "info" && <Info league={league} />} */}
        {activeTab === "players" && <Players league={league} />}
        {activeTab === "teams" && <Teams league={league} />}
        {activeTab === "events" && <Events leagueId={league.id} />}
      </div>
    </div>
  );
}
