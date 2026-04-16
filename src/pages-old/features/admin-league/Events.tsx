import { useState } from "react";
import { Link } from "react-router";
import { useLeagueEvents } from "@api/league/queries";
import { formatCase } from "@/utils/format";
import dayjs from "dayjs";

import SingleEvent from "../league-creator/event-builder/single/SingleEvent";
import MultipleEvents from "../league-creator/event-builder/multi/MultipleEvents";
import Modal from "@/components/layout/Modal";
import Table, { type Column } from "@/components/Table";

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    upcoming: "bg-info text-white",
    complete: "bg-success text-white",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {formatCase(status)}
    </span>
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
  const [event, setEvent] = useState<any>(null);
  const [createMode, setCreateMode] = useState<"single" | "multiple" | null>("multiple");
  const { data: events } = useLeagueEvents(leagueId!);

  const columns: Column<any>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "format", label: "Format", render: (value) => formatCase(value) },
    { key: "scoringFormat", label: "Scoring Type", render: (value) => formatCase(value) },
    { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
    { key: "date", label: "Date", render: (value) => dayjs(value).format("MM/DD/YYYY") },
    {
      key: "id",
      label: "Actions",
      render: (value) => (
        <div>
          <Link to={`/admin/league/${leagueId}/event/${value}`}>
            <button className="btn btn-primary btn-xs">Add Scores</button>
          </Link>
          <button
            className="btn btn-secondary btn-xs ml-2"
            onClick={() => {
              const selectedEvent = events?.find((e: any) => e.id === value);
              setEvent(selectedEvent);
              setIsOpen(true);
              setCreateMode("single");
            }}
          >
            Edit
          </button>
          <button className="btn btn-danger btn-xs ml-2">Delete</button>
        </div>
      ),
    },
  ];

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
        <div className="space-y-2">
          <CreateButton
            type="single"
            text="Add New Event"
            setIsOpen={setIsOpen}
            setCreateMode={setCreateMode}
          />
          <Table columns={columns} data={events || []} />
        </div>
      )}

      <Modal
        isOpen={isOpen}
        title="Add Event"
        onClose={() => {
          setEvent(null);
          setIsOpen(false);
        }}
      >
        {createMode === "single" && (
          <SingleEvent
            event={event}
            closeDialog={() => {
              setEvent(null);
              setIsOpen(false);
            }}
          />
        )}
        {createMode === "multiple" && <MultipleEvents closeDialog={() => setIsOpen(false)} />}
      </Modal>
    </div>
  );
}
