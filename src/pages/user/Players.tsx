import { useParams } from "react-router";
import { useLeaguePlayers } from "../../../api/league/queries";

import Table from "@/components/Table";
import type { Column } from "@/components/Table";
import { Icon } from "@/components/layout/Icon";
import { Users } from "lucide-react";
import Card from "@/components/layout/Card";

export default function Players() {
  const params = useParams();
  const leagueId = Number(params.leagueId);
  console.log("Players leagueId:", leagueId);
  const { data: players } = useLeaguePlayers(leagueId);

  const columns: Column<any>[] = [
    { key: "id", label: "ID" },
    { key: "first", label: "First Name" },
    { key: "last", label: "Last Name" },
    { key: "email", label: "Email" },
    {
      key: "handicap",
      label: "Handicap",
      render: (value) => value?.toFixed(1) || "-",
    },
    { key: "seasonPoints", label: "Points" },
    { key: "seasonRank", label: "Rank" },
    {
      key: "id",
      label: "Profile",
      render: (value) => (
        <a href={`/league/${leagueId}/player/${value}`} className="text-blue-600 hover:underline">
          View Profile
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Icon icon={Users} size={40} className="mr-2" />
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-sm text-gray-600">
            View and manage all players in the league. You can see their details,
          </p>
        </div>
      </div>

      <Table
        heading={`Total Players: ${players?.length || 0}`}
        data={players || []}
        columns={columns}
        className="rounded-lg border border-base-300"
      />
    </div>
  );
}
