import { useLeagueEvent } from "@api/league/queries";
import { useParams } from "react-router";
// import Scores from "./scores/Scores";
// import TeamMatch from "./scores/TeamMatchOld";
// import SingleStroke from "./scores/SingleStroke";
// import SingleMatch from "./scores/SingleMatch";
import ScoresX from "./scores/ScoresX";

export default function Event() {
  const { leagueId, eventId } = useParams<{ leagueId: string; eventId: string }>();

  const { data: event, isLoading, isError } = useLeagueEvent(Number(leagueId), Number(eventId));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading event.</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{event.name}</h1>
      <div className=""></div>
      <div className="scores">
        {/* {event.type === "individual" && event.scoringFormat === "stroke" && (
          <SingleStroke event={event} />
        )}
        {event.type === "individual" && event.scoringFormat === "match" && (
          <SingleMatch event={event} />
        )}
        {event.type === "team" && event.scoringFormat === "match" && <TeamMatch event={event} />} */}
        <ScoresX event={event} />
      </div>
    </div>
  );
}
