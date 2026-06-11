// get all the leagues based on the admin id
// if no leagues show the "no leagues exist page" with option to create league
// if leagues exist show the "league management page" with ability to edit league details, add/remove players, view stats
import { useAdminLeagues } from "@api/admin/queries";
import NewAdmin from "./NewAdmin";
import PageHeader from "@/components/layout/PageHeader";
import { ChevronsRight, Globe, Lock, Plus, Shield } from "lucide-react";
import Card from "@/components/layout/Card";
import Badge from "@/components/layout/Badge";
import Divider from "@/components/layout/Divider";
import { Link } from "react-router";

const LeagueCard = ({ league }: any) => {
  console.log("Rendering league card for:", league);

  return (
    <Link to={`/admin/league/${league.id}`} className="block h-full">
      <Card className="cursor-pointer h-full">
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
      </Card>
    </Link>
  );
};

export default function AdminDashboard() {
  const { data: leagues } = useAdminLeagues();

  console.log("Admin leagues:", leagues);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My Leagues"
        subTitle="Manage your leagues, players, and events"
        icon={<Shield size={14} />}
        iconText="DASHBOARD"
      />
      {leagues && leagues.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 mt-2 auto-rows-fr items-stretch">
          <Link to="/admin/league/create" className="block h-full">
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
          {leagues.map((league: any) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      ) : (
        <NewAdmin />
      )}
    </div>
  );
}
