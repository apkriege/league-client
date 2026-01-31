import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLeague } from "@api/league/queries";
import { useLeagueStore } from "@/stores/leagueStore";

import Tabs from "@/components/layout/Tabs";
import Events from "@/features/admin-league/Events";
import Info from "@/features/admin-league/Info";
import Players from "@/features/admin-league/Players";
import Teams from "@/features/admin-league/Teams";

export default function League() {
  const params = useParams();
  const { setLeague } = useLeagueStore();
  const { data: league, isLoading } = useLeague(Number(params.leagueId));
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    if (league) {
      setLeague(league);
    }
  }, [league, setLeague]);

  const tabs = [
    { id: "info", label: "Info" },
    { id: "players", label: "Players" },
    { id: "teams", label: "Teams" },
    { id: "events", label: "Events" },
    // { id: "summary", label: "Summary" },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!league) {
    return <div>League not found</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="header">
        <h1 className="text-3xl font-bold">{league.name}</h1>
        <p className="text-sm">{league.description}</p>
      </div>
      <div className="mt-4">
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
      </div>
      <div className="mt-4">
        {activeTab === "info" && <Info league={league} />}
        {activeTab === "players" && <Players league={league} />}
        {activeTab === "teams" && <Teams league={league} />}
        {activeTab === "events" && <Events leagueId={league.id} />}
        {/* {activeTab === "summary" && <div>Summary Content</div>} */}
      </div>
    </div>
  );
}
