import { useEffect } from "react";
import { useParams } from "react-router";
import { useLeagueStore } from "@/stores/leagueStore";
import PageHeader from "@/components/layout/PageHeader";
import { useAdminLeague } from "@api/admin/queries";

export default function League() {
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

  console.log("League data:", league);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Admin Dashboard"
        subTitle="Manage your leagues, players, teams, and events all in one place."
        // icon={<ShieldHalf size={14} />}
        // iconText="LEAGUE"
      />
    </div>
  );
}
