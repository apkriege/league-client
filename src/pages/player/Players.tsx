import PageHeader from "@/components/layout/PageHeader";
import { formatPhone } from "@/utils/format";
import { useLeague } from "@api/league/queries";
import { SquarePen, Trash2 } from "lucide-react";
import { useParams } from "react-router";
import Table from "@/components/Table";
import { useAppStore } from "@/stores/appStore";

export default function Players() {
  const { user } = useAppStore();
  const { leagueId } = useParams(); // Get leagueId from URL params
  const { data: league } = useLeague(Number(leagueId)); // Fetch league details using the custom hook

  if (!league) {
    return <div>Loading...</div>;
  }

  // sort first by type, then by player name
  const p = [...league.players].sort((a: any, b: any) => {
    if (a.type === b.type) {
      return a.firstName.localeCompare(b.firstName);
    }
    return a.type === "player" ? -1 : 1;
  });

  let columns: any = [
    {
      key: "firstName",
      label: "Name",
      width: "65%",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-content rounded-lg w-8 h-8 flex items-center justify-center text-xs uppercase">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div className="">
            <p className="text-md font-semibold text-primary mb-0.5">
              {row.firstName} {row.lastName}
            </p>
            <p className="font-light text-[10px] text-gray-500 flex items-center gap-1.5">
              <span>{row.email}</span>
              <span>/</span>
              <span>{formatPhone(row.phone)}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: any) => (
        <div
          className={`badge badge-${value === "player" ? "secondary" : "accent"} text-[9px] rounded-xl font-semibold`}
        >
          {value.toUpperCase()}
        </div>
      ),
    },
    {
      key: "handicap",
      label: "HCP",
      render: (value: any) => <p className="text-md font-bold">{value}</p>,
    },
  ];

  if (user.role !== "ADMIN") {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <SquarePen
            size={16}
            className="cursor-pointer text-blue-400"
            // onClick={() => editPlayer(row)}
          />
          <Trash2
            size={18}
            className="cursor-pointer text-red-400"
            // onClick={() => removePlayer(row.id)}
          />
        </div>
      ),
    });
  }

  return (
    <div>
      <PageHeader
        title="Players"
        subTitle="Manage your players, their profiles, and stats"
        icon={<></>}
        iconText="PLAYERS"
      />

      <div className="">
        <Table
          heading={`Total Players: ${league.players.length}`}
          data={p}
          columns={columns}
          size="sm"
        />
      </div>
    </div>
  );
}
