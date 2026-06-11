import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table from "@/components/Table";
import { useAdminLeagues } from "@api/admin/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { Eye, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router";

export default function LeaguesAdmin() {
  const { data: leagues = [], isLoading, isError, error } = useAdminLeagues();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading leagues...
      </div>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "Leagues Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Leagues"
        }
        message={getApiErrorMessage(error, "The superadmin leagues page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
      />
    );
  }

  const columns = [
    {
      key: "name",
      label: "League",
      render: (_value: any, row: any) => (
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-base-content">{row.name}</p>
          <p className="text-[11px] text-base-content/60 capitalize">
            {row.type} {row.format ? `• ${row.format}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "admin",
      label: "Admin",
      render: (_value: any, row: any) => (
        <div className="text-xs text-base-content/70">
          {row.contactFirstName || row.contactLastName
            ? `${row.contactFirstName || ""} ${row.contactLastName || ""}`.trim()
            : row.contactEmail || "Unknown"}
        </div>
      ),
    },
    {
      key: "players",
      label: "Players",
      width: "100px",
      render: (_value: any, row: any) => (
        <span className="text-xs font-semibold text-base-content">{row._count?.players ?? 0}</span>
      ),
    },
    {
      key: "events",
      label: "Events",
      width: "100px",
      render: (_value: any, row: any) => (
        <span className="text-xs font-semibold text-base-content">{row._count?.events ?? 0}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "240px",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/league/${row.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-base-300 px-2.5 py-1.5 text-[11px] font-semibold text-base-content/70 hover:bg-base-200"
          >
            <Eye size={12} />
            View User
          </Link>
          <Link
            to={`/league/${row.id}/admin`}
            className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
          >
            <ShieldCheck size={12} />
            View Admin
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="All Leagues"
        subTitle="Browse every league and open the member or admin view."
        icon={<Users size={14} />}
        iconText="SUPER ADMIN"
      />

      <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-base-content">League Directory</p>
            <p className="text-xs text-base-content/60">{leagues.length} total leagues</p>
          </div>
        </div>

        <Table data={leagues} columns={columns} />
      </div>
    </div>
  );
}
