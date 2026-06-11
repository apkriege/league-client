import { useState } from "react";
import { Link, useParams } from "react-router";
import { useLeagueEvent } from "@api/league/queries";
import { formatCase } from "@/utils/format";
import dayjs from "dayjs";

import Tabs from "@/components/layout/Tabs";
import Scores from "./scores/Scores";
import { ArrowLeft } from "lucide-react";

const EventMetric = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col">
    <p className="text-xs text-base-content/50">{label}</p>
    <p className="font-semibold">{formatCase(value.toString())}</p>
  </div>
);

export default function Event() {
  const { leagueId, eventId } = useParams<{ leagueId: string; eventId: string }>();
  const { data: event, isLoading, isError } = useLeagueEvent(Number(leagueId), Number(eventId));
  const [activeTab, setActiveTab] = useState("match");

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
      <div className="mb-2">
        <Link
          to={`/admin/league/${leagueId}`}
          className="text-sm text-blue-500 cursor-pointer flex items-center gap-1 hover:underline"
        >
          <ArrowLeft className="cursor-pointer" size={16} /> Back to All Events
        </Link>
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-5">{event.name}</h1>
        <div className="grid grid-cols-5 gap-y-2 gap-x-4">
          <EventMetric label="Format" value={event.format} />
          <EventMetric label="Scoring" value={event.scoringFormat} />
          <EventMetric label="Date" value={new Date(event.date).toLocaleDateString()} />
          <EventMetric label="Start Time" value={dayjs(event.startTime).format("hh:mm a")} />
          <EventMetric label="Status" value={event.status} />
          <EventMetric label="Course" value={event.course.name} />
          <EventMetric label="Tees" value={event.tee.color} />
          <EventMetric label="Start Side" value={event.startSide} />
          <EventMetric label="Holes" value={event.holes} />
          <EventMetric label="Interval" value={`${event.interval} min`} />
        </div>
      </div>
      <div className="divider" />
      <div className="scores">
        <div className="mt-4">
          <Tabs
            className="w-fit"
            tabs={[
              // { id: "all", label: "All Players" },
              { id: "stroke", label: "Individual Flights" },
              { id: "match", label: "Matchplay Flights" },
            ]}
            activeTab={activeTab}
            onTabClick={setActiveTab}
          />
        </div>
        <div className="mt-4">
          <Scores event={event} layout={activeTab} />
        </div>
      </div>
    </div>
  );
}
