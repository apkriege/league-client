import Button from "@/components/layout/Button";
import Table from "@/components/Table";
import { useAppStore } from "@/stores/appStore";
import { useLeagueEvents } from "@api/league/queries";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";

// NOT BEING USED CURRENTLY

export default function Events() {
  const { user } = useAppStore();
  const { leagueId } = useParams();
  const { data: events } = useLeagueEvents(Number(leagueId)!);
  const navigate = useNavigate();

  if (!events) {
    return <div>Loading events...</div>;
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (_value: any, row: any) => (
        <div className="flex flex-col">
          <p className="font-semibold text-sm">{row.name}</p>
          <p className="text-[10px] text-gray-400 capitalize">{row.type}</p>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (_value: any, row: any) => (
        <div className="flex flex-col">
          <p className="font-semibold text-xs">{row.course.name}</p>
          <p className="text-[10px] text-gray-400">
            {row.tee.name} Tees - {row.holes} Holes
          </p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value: any) => (
        <p className="text-xs font-medium">{dayjs(value).format("MMM D, YYYY")}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value: any, row: any) => (
        <p
          className={`text-xs font-medium ${row.completed ? "text-green-600" : "text-yellow-600"}`}
        >
          {row.completed ? "Completed" : "Upcoming"}
        </p>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "100px",
      render: (_value: any, row: any) => (
        <div className="flex gap-2">
          {user.isAdmin && (
            <>
              <Button
                size="xs"
                variant="outline"
                onClick={() => navigate(`/league/${leagueId}/events/${row.id}`)}
              >
                View
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  navigate(`/league/${leagueId}/events/${row.id}/scores`);
                }}
              >
                Scores
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <h3 className="text-md font-bold mb-1">League Details</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="skeleton h-40 w-full"></div>
          <div className="skeleton h-40 w-full"></div>
          <div className="skeleton h-40 w-full"></div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-bold mb-1">Events</h3>
          <Button
            size="xs"
            variant="primary"
            onClick={() => navigate(`/league/${leagueId}/events/create/single`)}
          >
            + Add Event
          </Button>
        </div>
        <Table data={events} columns={columns} />
      </div>
    </div>
  );
}
