import { useLeagueEvent } from "@api/league/queries";
import { useParams } from "react-router";
import { Header } from "@/components/layout/Page";

// details of the event

export default function Event() {
  const { leagueId, eventId } = useParams();

  const { data: event } = useLeagueEvent(Number(leagueId), Number(eventId));

  console.log("Event", event);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header title={event.name} />
    </div>
  );
}
