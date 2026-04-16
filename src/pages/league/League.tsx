import { useParams } from "react-router";
import { useLeague } from "@api/league/queries";

import PageHeader from "@/components/layout/PageHeader";
import { Globe } from "lucide-react";
import NoEvents from "../event/NoEvents";
import Events from "../event/Events";

export default function League() {
  const { leagueId } = useParams();
  const { data: league } = useLeague(Number(leagueId));

  console.log("League data:", league);

  if (!league) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 mb-4">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="League Name"
        subTitle="Overview of league details, events, and players"
        icon={<Globe size={14} />}
        iconText="LEAGUE"
      />

      <div className="">{league.events.length === 0 ? <NoEvents /> : <Events />}</div>
    </div>
  );
}
