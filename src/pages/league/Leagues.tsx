import Badge from "@/components/layout/Badge";
import Card from "@/components/layout/Card";
import Divider from "@/components/layout/Divider";
import PageHeader from "@/components/layout/PageHeader";

import { useAdminLeagues } from "@api/admin/queries";
import { Shield, Plus, Globe, ChevronsRight, Lock, Edit } from "lucide-react";
import { Link } from "react-router";

export default function Leagues() {
  const { data: leagues } = useAdminLeagues();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My Leagues"
        subTitle="Manage your leagues, players, and events"
        icon={<Shield size={14} />}
        iconText="DASHBOARD"
      />
      <div className="grid grid-cols-3 gap-3 mt-2 auto-rows-fr items-stretch">
        <Link to="/leagues/create" className="block h-full">
          <Card className="bg-primary h-full flex items-center justify-center cursor-pointer hover:bg-primary/95 transition-colors">
            <div className="flex flex-col items-center justify-center text-white text-center">
              <div className=" bg-gray-300/20 p-3 rounded-full mb-3 mt-3">
                <Plus size={24} />
              </div>
              <p className="text-lg font-semibold mb-2">Create New League</p>
              <p className="text-xs text-gray-500 w-2/3 text-center mb-2">
                Set up a new league and invite players
              </p>
            </div>
          </Card>
        </Link>
        {leagues && leagues.map((league: any) => <LeagueCard key={league.id} league={league} />)}
      </div>
    </div>
  );
}

const LeagueCard = ({ league }: any) => {
  return (
    <Card className="h-full">
      <div className="flex justify-end">
        <Link
          to={`/league/${league.id}/edit`}
          className="inline-flex items-center gap-1 rounded-md border border-base-300 px-2 py-1 text-[10px] font-semibold text-gray-500 hover:bg-base-200"
        >
          <Edit size={10} />
          Edit
        </Link>
      </div>
      <Link to={`/league/${league.id}`} className="block h-full cursor-pointer mt-2">
        <div className="flex flex-col ">
          <Badge
            size="xs"
            text={league._count.events > 0 ? "Live" : "Not Started"}
            icon={league._count.events > 0 ? <Globe size={12} /> : <Lock size={12} />}
            variant={league._count.events > 0 ? "primary" : ""}
          />
          <h3 className="text-lg font-bold mt-2">{league.name}</h3>
          <p className="text-gray-400 text-[11px] mb-8">
            <span>{league._count.players} Players</span>
          </p>
          <Divider className="my-2!" />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="text-[10px] font-semibold">OPEN LEAGUE</span>
            <span>
              <ChevronsRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};
