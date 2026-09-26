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

  const renderActions = (row: AdminLeagueListItem) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => handleSeasonSync(row)}
        disabled={syncSeason.isPending}
        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 disabled:opacity-50"
      >
        <RefreshCw size={14} className={syncSeason.isPending && syncSeason.variables === row.id ? "animate-spin" : ""} />
        {syncSeason.isPending && syncSeason.variables === row.id ? "Syncing..." : "Season Sync"}
      </button>
      <Link to={`/league/${row.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700">
        <Eye size={14} /> Member
      </Link>
      <Link to={`/league/${row.id}/admin`} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white">
        <ShieldCheck size={14} /> Admin
      </Link>
    </div>
  );

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
      render: (_value, row) => renderActions(row),
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="All Leagues"
        subTitle="Browse every league and open the member or admin view."
      />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">League Directory</p>
            <p className="text-xs text-slate-900/60">{leagues.length} total leagues</p>
          </div>
        </div>

        <Table
          data={leagues}
          columns={columns}
          renderMobileCard={(league) => (
            <div className="space-y-4">
              <div>
                <p className="break-words text-base font-black text-slate-900">{league.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{league.type} {league.format ? `· ${league.format}` : ""}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><span className="block text-xs text-slate-500">Players</span><span className="font-bold tabular-nums">{league._count?.players ?? 0}</span></p>
                <p><span className="block text-xs text-slate-500">Events</span><span className="font-bold tabular-nums">{league._count?.events ?? 0}</span></p>
              </div>
              <p className="break-all text-xs text-slate-500">Admin: {[league.contactFirstName, league.contactLastName].filter(Boolean).join(" ") || league.contactEmail || "Unknown"}</p>
              {renderActions(league)}
            </div>
          )}
        />
      </div>
    </div>
  );
}
