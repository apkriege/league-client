import Badge from "@/components/layout/Badge";
import Card from "@/components/layout/Card";
import Divider from "@/components/layout/Divider";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/context/useToast";
import { useAppStore } from "@/stores/appStore";

import { useAdminLeagues } from "@api/admin/queries";
import { useLeagues } from "@api/league/queries";
import { Plus, Globe, ChevronsRight, Lock, Edit } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { clearCreateLeagueDraft } from "./leagueDraft";

export default function Leagues() {
  const { user } = useAppStore();
  const role = String(user?.role || "").toUpperCase();
  const canManageLeagues = role === "ADMIN" || role === "SUPER";
  const adminLeaguesQuery = useAdminLeagues(canManageLeagues);
  const memberLeaguesQuery = useLeagues(Boolean(user) && role !== "VIEWER");
  const viewerLeaguesQuery = useLeagues(role === "VIEWER");
  const memberLeagues = (memberLeaguesQuery.data as any)?.leagues ?? [];
  const adminLeagues = adminLeaguesQuery.data ?? [];
  const adminLeagueIds = new Set(adminLeagues.map((league: any) => Number(league.id)));
  const leagues = canManageLeagues
    ? [
        ...adminLeagues,
        ...memberLeagues.filter((league: any) => !adminLeagueIds.has(Number(league.id))),
      ]
    : ((viewerLeaguesQuery.data as any)?.leagues ?? memberLeagues);
  const activeQueries = canManageLeagues
    ? [adminLeaguesQuery, memberLeaguesQuery]
    : [role === "VIEWER" ? viewerLeaguesQuery : memberLeaguesQuery];
  const isLoading = activeQueries.some((query) => query.isLoading);
  const activeError = activeQueries.find((query) => query.isError)?.error;
  const { show } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (checkoutStatus === "registration_success") {
      show("Registration payment completed. You can now create your league.", "success");
    } else if (checkoutStatus === "registration_cancel") {
      show("Registration checkout was canceled.", "warning");
    } else {
      return;
    }

    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, [show]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My Leagues"
        subTitle="Manage your leagues, players, and events"
      />
      {activeError && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(activeError as any)?.message || "Unable to load leagues."}
        </div>
      )}
      {isLoading && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Loading leagues...
        </div>
      )}
      {!isLoading && !activeError && leagues.length === 0 && !canManageLeagues && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white px-5 py-8 text-center">
          <p className="text-sm font-bold text-gray-700">No league memberships yet</p>
          <p className="mt-1 text-xs text-gray-400">
            When a league admin invites you or links your player profile, your leagues will appear here.
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mt-2 auto-rows-fr items-stretch">
        {canManageLeagues && (
          <Link
            to="/leagues/create"
            className="block h-full"
            onClick={clearCreateLeagueDraft}
          >
            <Card className="bg-slate-900 h-full flex items-center justify-center cursor-pointer hover:bg-slate-900/95 transition-colors">
              <div className="flex flex-col items-center justify-center text-white text-center">
                <div className=" bg-gray-300/20 p-3 rounded-full mb-3 mt-3">
                  <Plus size={24} />
                </div>
                <p className="text-lg font-semibold mb-2">Create New League</p>
                <p className="text-xs text-gray-500 w-2/3 text-center mb-2">
                  Set up a new league and invite players
                </p>
              </div>
            </Card>
          </Link>
        )}
        {leagues &&
          leagues.map((league: any) => (
            <LeagueCard
              key={league.id}
              league={league}
              canManageLeague={canManageLeagues && adminLeagueIds.has(Number(league.id))}
            />
          ))}
      </div>
    </div>
  );
}

const LeagueCard = ({ league, canManageLeague }: any) => {
  const eventCount = Number(league?._count?.events ?? league?.events?.length ?? 0);
  const playerCount = Number(league?._count?.players ?? league?.players?.length ?? 0);

  return (
    <Card className="h-full">
      {canManageLeague && (
        <div className="flex justify-end">
          <Link
            to={`/league/${league.id}/edit`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-gray-500 hover:bg-slate-100"
          >
            <Edit size={10} />
            Edit
          </Link>
        </div>
      )}
      <Link to={`/league/${league.id}`} className="block h-full cursor-pointer mt-2">
        <div className="flex flex-col ">
          <Badge
            size="xs"
            text={eventCount > 0 ? "Live" : "Not Started"}
            icon={eventCount > 0 ? <Globe size={12} /> : <Lock size={12} />}
            variant={eventCount > 0 ? "primary" : ""}
          />
          <h3 className="text-lg font-bold mt-2">{league.name}</h3>
          <p className="text-gray-400 text-[11px] mb-8">
            <span>{playerCount} Players</span>
          </p>
          <Divider className="my-2!" />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="text-[10px] font-semibold">OPEN LEAGUE</span>
            <span>
              <ChevronsRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};
