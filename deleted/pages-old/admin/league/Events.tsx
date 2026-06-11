import Button from "@/components/layout/Button";
import Table from "@/components/Table";
import { useLeagueEvents } from "@api/league/queries";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";

export default function Events() {
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
      render: (_value: any, row: any) => (
        <div className="flex gap-2">
          <Button
            size="xs"
            variant="info"
            onClick={() => {
              navigate(`/admin/league/${leagueId}/events/${row.id}`);
            }}
          >
            {row.completed ? "View" : "Enter"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Table data={events} columns={columns} />
    </div>
  );
}
