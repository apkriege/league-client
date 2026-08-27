import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import Table, { type Column } from "@/components/Table";
import { useToast } from "@/context/useToast";
import { useSyncAdminLeagueSeason } from "@api/admin/mutations";
import { useAdminLeagues } from "@api/admin/queries";
import type { AdminLeagueListItem } from "@api/admin/types";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { Eye, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

export default function LeaguesAdmin() {
  const { data: leagues = [], isLoading, isError, error } = useAdminLeagues();
  const syncSeason = useSyncAdminLeagueSeason();
  const { show } = useToast();

  const handleSeasonSync = (league: AdminLeagueListItem) => {
    const confirmed = window.confirm(
      `Recalculate the full season for "${league.name}"? This rewrites handicaps, net scores, points, and standings from the saved hole scores.`,
    );
    if (!confirmed) return;

    syncSeason.mutate(league.id, {
      onSuccess: ({ result }) => {
        show(
          `Season sync completed for ${league.name}: ${result.roundsUpdated} rounds and ${result.playersUpdated} players updated.`,
          "success",
        );
      },
      onError: (error) => {
        show(getApiErrorMessage(error, `Season sync failed for ${league.name}.`), "error");
      },
    });
  };

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

  const columns: Column<AdminLeagueListItem>[] = [
    {
      key: "name",
      label: "League",
      render: (_value, row) => (
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-900/60 capitalize">
            {row.type} {row.format ? `• ${row.format}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "contactEmail",
      label: "Admin",
      render: (_value, row) => (
        <div className="text-xs text-slate-900/70">
          {row.contactFirstName || row.contactLastName
            ? `${row.contactFirstName || ""} ${row.contactLastName || ""}`.trim()
            : row.contactEmail || "Unknown"}
        </div>
      ),
    },
    {
      key: "_count",
      label: "Players",
      width: "100px",
      render: (_value, row) => (
        <span className="text-xs font-semibold text-slate-900">{row._count?.players ?? 0}</span>
      ),
    },
    {
      key: "_count",
      label: "Events",
      width: "100px",
      render: (_value, row) => (
        <span className="text-xs font-semibold text-slate-900">{row._count?.events ?? 0}</span>
      ),
    },
    {
      key: "id",
      label: "",
      width: "350px",
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSeasonSync(row)}
            disabled={syncSeason.isPending}
            title="Recalculate season"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={
                syncSeason.isPending && syncSeason.variables === row.id ? "animate-spin" : ""
              }
            />
            {syncSeason.isPending && syncSeason.variables === row.id ? "Syncing..." : "Season Sync"}
          </button>
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
