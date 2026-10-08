import LoadingState from "@/components/layout/LoadingState";
import SectionKicker from "@/components/layout/SectionKicker";
import { useParams } from "react-router";
import { usePlayerStats } from "@api/players/queries";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useMemo, useState } from "react";
import useAnimatedDrawer from "@/hooks/useAnimatedDrawer";
import {
  Flag,
  History,
  Trophy,
  X,
} from "lucide-react";
import { PlayerProfileSummary } from "./components/PlayerSummary";
import PlayerHandicapCalculation from "./components/PlayerHandicapCalculation";
import { PlayerRoundBreakdown, RoundHistory } from "./components/PlayerRoundTables";
import PlayerDataSection from "./components/PlayerDataSection";
import { formatHandicap } from "./playerFormatters";
import { calculatePlayerRoundAverages } from "./playerRoundAverages";
import PlayerIntelligenceDashboard from "@/features/player-intelligence/components/PlayerIntelligenceDashboard";

export default function Player() {
  const { leagueId, playerId } = useParams();
  const [roundBreakdownView, setRoundBreakdownView] = useState<"gross" | "net">("gross");
  const handicapDrawer = useAnimatedDrawer();
  const numericLeagueId = Number(leagueId);
  const { data, isLoading, isError, error } = usePlayerStats(numericLeagueId, Number(playerId));
  const handicapHoleCount = Number(data?.handicapHoleBasis) === 9 ? 9 : 18;
  const roundAverages = useMemo(
    () => calculatePlayerRoundAverages(data?.rounds ?? []),
    [data?.rounds],
  );
  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "Player Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Player"
        }
        message={getApiErrorMessage(error, "The player page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
        actionTo={leagueId ? `/league/${leagueId}/players` : "/leagues"}
        actionLabel="Back to Players"
      />
    );
  }

  if (isLoading) {
    return <LoadingState>Loading player...</LoadingState>;
  }

  if (!data) return null;

  const { player, stats, rounds = [] } = data;
  const fullName = `${player.firstName} ${player.lastName}`;
  const hcpDelta = stats?.handicapChange ?? null;

  return (
    <div className="pb-10">
      <PageHeader title={fullName} />

      <div className="mb-5 mt-3">
        <PlayerProfileSummary
          playerType={player.type}
          teamName={player.team?.name}
          rounds={stats?.rounds ?? 0}
          rank={player.seasonRank}
          handicap={formatHandicap(player.handicap)}
          handicapHoleCount={handicapHoleCount}
          handicapChange={hcpDelta}
          handicapStatus={data.handicapCalculation.status}
          onOpenHandicap={() => handicapDrawer.open()}
        />
      </div>

      {!stats ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No rounds completed yet this season.
        </div>
      ) : (
        <div className="space-y-9">
          <div>
            <PlayerIntelligenceDashboard
              intelligence={data.intelligence}
              teamName={player.team?.name}
              seasonSnapshot={{
                totalPoints: stats.totalPoints,
                averagePoints9: roundAverages[9]?.avgPoints ?? null,
                averagePoints18: roundAverages[18]?.avgPoints ?? null,
                averageGross9: roundAverages[9]?.avgGross ?? null,
                averageGross18: roundAverages[18]?.avgGross ?? null,
                lowGross9: roundAverages[9]?.lowGross ?? null,
                lowGross18: roundAverages[18]?.lowGross ?? null,
                averageNet9: roundAverages[9]?.avgNet ?? null,
                averageNet18: roundAverages[18]?.avgNet ?? null,
                lowNet9: roundAverages[9]?.lowNet ?? null,
                lowNet18: roundAverages[18]?.lowNet ?? null,
                rounds: stats.rounds,
                rounds9: roundAverages[9]?.rounds ?? 0,
                rounds18: roundAverages[18]?.rounds ?? 0,
              }}
            />
          </div>

          <div>
            <PlayerDataSection
              title="Round History"
              icon={<Trophy size={16} strokeWidth={2.5} />}
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <History size={13} className="text-emerald-600" strokeWidth={2.5} />
                    <h3 className="text-xs font-bold text-slate-900">Full Round History</h3>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {rounds.length} completed
                  </span>
                </div>
                <RoundHistory rounds={rounds} leagueId={leagueId} />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <Flag size={13} className="text-emerald-600" strokeWidth={2.5} />
                    <h3 className="text-xs font-bold text-slate-900">Round Score Breakdown</h3>
                  </div>
                  <div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setRoundBreakdownView("gross")}
                      aria-pressed={roundBreakdownView === "gross"}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                        roundBreakdownView === "gross"
                          ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Gross
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoundBreakdownView("net")}
                      aria-pressed={roundBreakdownView === "net"}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                        roundBreakdownView === "net"
                          ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Net
                    </button>
                  </div>
                </div>

                <PlayerRoundBreakdown
                  rounds={rounds}
                  leagueId={leagueId}
                  scoreView={roundBreakdownView}
                />
              </div>
            </PlayerDataSection>
          </div>
        </div>
      )}

      {handicapDrawer.isMounted && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close handicap drawer"
            onClick={handicapDrawer.close}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
              handicapDrawer.isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`app-slideout-drawer absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 overflow-y-auto transition-transform duration-300 ease-out ${
              handicapDrawer.isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <SectionKicker>Handicap Detail</SectionKicker>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Your handicap
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  The rounds that count and how they add up.
                </p>
              </div>
              <button
                type="button"
                onClick={handicapDrawer.close}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <PlayerHandicapCalculation calculation={data.handicapCalculation} />
          </aside>
        </div>
      )}
    </div>
  );
}
