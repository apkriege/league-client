import { useEffect } from "react";
import { useParams } from "react-router";
import { useAdminLeague } from "@api/admin/queries";
import { useLeagueStore } from "@/stores/leagueStore";

import PageHeader from "@/components/layout/PageHeader";
import NoEvents from "./NoEvents";
import Events from "./Events";

import { Rocket } from "lucide-react";

export default function AdminLeague() {
  const params = useParams();
  const { setLeague } = useLeagueStore();
  const { data: league, isLoading } = useAdminLeague(Number(params.leagueId));

  useEffect(() => {
    if (league) {
      setLeague(league);
    }
  }, [league, setLeague]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!league) {
    return <div>League not found</div>;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={league.name}
        subTitle={league.description}
        icon={<Rocket size={14} />}
        iconText="LEAGUE"
      />

      <div className="">{league.events.length === 0 ? <NoEvents /> : <Events />}</div>
    </div>
  );
}
