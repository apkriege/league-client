import PageHeader from "@/components/layout/PageHeader";
import { useLeagueEvent } from "@api/league/queries";
import { useParams } from "react-router";

interface EventProps {
  editMode?: boolean;
}

export default function Event({ editMode = false }: EventProps) {
  const { leagueId, eventId } = useParams();
  const { data: event } = useLeagueEvent(Number(leagueId), Number(eventId));

  console.log(event);

  return (
    <div>
      <PageHeader
        title={editMode ? "Edit Event" : "Event Name"}
        subTitle="Overview of event details, flights, and scores"
      />
    </div>
  );
}
