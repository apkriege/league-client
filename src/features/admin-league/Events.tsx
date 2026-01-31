import { useState } from "react";
import { Link } from "react-router";
import { useLeagueEvents } from "@api/league/queries";
import { convertTime, formatCase } from "@/utils/format";

import SingleEvent from "../event-builder/single/SingleEvent";
import MultipleEvents from "../event-builder/multi/MultipleEvents";
import Modal from "@/components/layout/Modal";

const PlayerFlight = ({ flight }: any) => {
  return flight.players.map((playerFlight: any, index: number) => (
    <div key={index} className="mt-1">
      <p className="text-xs font-semibold">
        {playerFlight.player.firstName} {playerFlight.player.lastName}
      </p>
    </div>
  ));
};

const TeamFlight = ({ flight }: any) => {
  return (
    <div className="mt-1 flex">
      {flight.teams.map((team: any, index: number) => (
        <div key={index} className="mr-4">
          <p className="text-xs font-semibold">Team {index + 1}:</p>
          {team.team.players.map((player: any, pIndex: number) => (
            <p key={pIndex} className="text-xs">
              {player.firstName} {player.lastName}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

const Event = ({ event }: any) => {
  return (
    <div className="card bg-base-200 rounded-box border px-4 py-2">
      <div className="flex justify-between items-center">
        <h2 className="text-md font-bold">
          {event.name} - {formatCase(event.status)}
        </h2>
        <Link to={`/admin/league/${event.leagueId}/event/${event.id}`}>
          <button className="btn btn-xs btn-primary">View Details</button>
        </Link>
      </div>
      <p className="text-xs text-gray-400">Format: {formatCase(event.format)}</p>
      <p className="text-xs text-gray-400">Date: {new Date(event.date).toLocaleDateString()}</p>

      <div className="flex gap-2">
        {(event.flights && event.flights.length) > 0 &&
          event.flights.map((flight: any, index: number) => (
            <div key={index} className="card bg-base-300 border px-2 py-1 mt-2">
              <h3 className="text-xs font-semibold flex justify-between">
                <span>Flight {index + 1}</span>
                <span>{convertTime(flight.startTime)}</span>
              </h3>
              {event.type === "individual" ? (
                <PlayerFlight flight={flight} />
              ) : (
                <TeamFlight flight={flight} />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

const CreateButton = ({
  type,
  text,
  setIsOpen,
  setCreateMode,
}: {
  type: "single" | "multiple";
  text: string;
  setIsOpen: (isOpen: boolean) => void;
  setCreateMode: (mode: "single" | "multiple") => void;
}) => {
  return (
    <div
      className="card bg-base-200 hover:bg-base-100 border rounded-box grid h-14 grow place-items-center text-sm font-semibold cursor-pointer"
      onClick={() => {
        setCreateMode(type);
        setIsOpen(true);
      }}
    >
      {text}
    </div>
  );
};

export default function Events({ leagueId }: { leagueId?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"single" | "multiple" | null>("multiple");
  const { data: events } = useLeagueEvents(leagueId!);

  return (
    <div className="events">
      {!events || events.length === 0 ? (
        <>
          <p className="text-xs italic text-gray-300 mb-4">
            There are no events yet. Please select how you would like to create events. You can
            create a single event or multiple events at once. Once selected, you can always add more
            later but after creating events you cannot switch between single and multiple event
            modes.
          </p>
          <div className="flex w-full flex-col lg:flex-row">
            <CreateButton
              type="single"
              text="Create Single Event"
              setIsOpen={setIsOpen}
              setCreateMode={setCreateMode}
            />
            <div className="divider lg:divider-horizontal">OR</div>
            <CreateButton
              type="multiple"
              text="Create Multiple Events"
              setIsOpen={setIsOpen}
              setCreateMode={setCreateMode}
            />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <CreateButton
            type="single"
            text="Add New Event"
            setIsOpen={setIsOpen}
            setCreateMode={setCreateMode}
          />
          {events.map((event: any) => (
            <Event key={event.id} event={event} />
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} title="Add Event" onClose={() => setIsOpen(false)}>
        {createMode === "single" && <SingleEvent closeDialog={() => setIsOpen(false)} />}
        {createMode === "multiple" && <MultipleEvents closeDialog={() => setIsOpen(false)} />}
      </Modal>
    </div>
  );
}
