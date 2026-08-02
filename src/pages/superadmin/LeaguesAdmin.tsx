import LoadingState from "@/components/layout/LoadingState";
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
    return <LoadingState>Loading leagues...</LoadingState>;
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
        message={getApiErrorMessage(
          error,
          "The superadmin leagues page could not be loaded right now."
        )}
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
          <p className="text-sm font-semibold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-900/60 capitalize">
            {row.type} {row.format ? `• ${row.format}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "admin",
      label: "Admin",
      render: (_value: any, row: any) => (
        <div className="text-xs text-slate-900/70">
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
        <span className="text-xs font-semibold text-slate-900">{row._count?.players ?? 0}</span>
      ),
    },
    {
      key: "events",
      label: "Events",
      width: "100px",
      render: (_value: any, row: any) => (
        <span className="text-xs font-semibold text-slate-900">{row._count?.events ?? 0}</span>
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
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-900/70 hover:bg-slate-100"
          >
            <Eye size={12} />
            View User
          </Link>
          <Link
            to={`/league/${row.id}/admin`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-900/20 bg-slate-900/10 px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-slate-900/15"
          >
            <ShieldCheck size={12} />
            View Admin
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="All Leagues"
        subTitle="Browse every league and open the member or admin view."
        icon={<Users size={14} />}
        iconText="SUPER ADMIN"
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">League Directory</p>
            <p className="text-xs text-slate-900/60">{leagues.length} total leagues</p>
          </div>
        </div>

        <Table data={leagues} columns={columns} />
      </div>
    </div>
  );
}
