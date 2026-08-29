import { ShieldHalf, Swords, Zap } from "lucide-react";
import { Link } from "react-router";
import type { buildEventDashboard } from "@/features/league-intelligence/eventDashboard";
import type { EventInsightInput } from "@/features/league-intelligence/types";
import { SkinsList, type SkinsDrawerContent } from "./EventSkins";
import {
  EventInsightBadge,
  EventInsightEmpty,
  EventInsightSection,
} from "./EventInsightPrimitives";

type EventDashboard = ReturnType<typeof buildEventDashboard>;

const formatPoints = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default function EventMatchupsPanel({
  event,
  dashboard,
  leagueId,
  onOpenSkins,
}: {
  event: EventInsightInput;
  dashboard: EventDashboard;
  leagueId: number;
  onOpenSkins: (content: SkinsDrawerContent) => void;
}) {
  const grossSkins = event.metrics?.skins?.playerSkins ?? [];
  const netSkins = event.metrics?.skins?.playerNetSkins ?? [];

  return (
    <div className="space-y-4">
      {(dashboard.matchups.length > 0 || dashboard.teamMatchups.length > 0) ? (
        <EventInsightSection
          title="Matchup theater"
          description="Assigned battles scored hole by hole, including lead changes and final separation"
          action={<EventInsightBadge><Swords size={10} /> {dashboard.matchups.length + dashboard.teamMatchups.length} battles</EventInsightBadge>}
        >
          <div className="grid gap-px bg-slate-100 lg:grid-cols-2">
            {dashboard.teamMatchups.map((matchup) => (
              <article key={`${matchup.left.teamId}-${matchup.right.teamId}`} className="bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <ShieldHalf size={14} strokeWidth={2.5} />
                    <p className="text-[9px] font-black uppercase tracking-[0.14em]">Team battle</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-blue-700">
                    {matchup.label}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <Link to={`/league/${leagueId}/team/${matchup.left.teamId}`} className="min-w-0 text-right">
                    <span className="block truncate text-xs font-black text-slate-900 hover:text-emerald-700">{matchup.left.name}</span>
                    <span className="text-[10px] text-slate-400">{formatPoints(matchup.left.points)} pts</span>
                  </Link>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-[9px] font-black text-white">VS</span>
                  <Link to={`/league/${leagueId}/team/${matchup.right.teamId}`} className="min-w-0">
                    <span className="block truncate text-xs font-black text-slate-900 hover:text-emerald-700">{matchup.right.name}</span>
                    <span className="text-[10px] text-slate-400">{formatPoints(matchup.right.points)} pts</span>
                  </Link>
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-500">
                  {matchup.margin === 0 ? "Finished level" : `${formatPoints(matchup.margin)}-point final margin`}
                </p>
              </article>
            ))}
            {dashboard.matchups.map((matchup) => (
              <article key={`${matchup.left.playerId}-${matchup.right.playerId}`} className="bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-violet-600">
                    <Swords size={14} strokeWidth={2.5} />
                    <p className="text-[9px] font-black uppercase tracking-[0.14em]">Player matchup</p>
                  </div>
                  <span className="rounded-full bg-violet-50 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-violet-700">
                    {matchup.label}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <Link to={`/league/${leagueId}/player/${matchup.left.playerId}`} className="min-w-0 text-right">
                    <span className="block truncate text-xs font-black text-slate-900 hover:text-emerald-700">{matchup.left.name}</span>
                    <span className="text-[10px] text-slate-400">{matchup.left.holesWon} holes won</span>
                  </Link>
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-[9px] font-black text-white">VS</span>
                  <Link to={`/league/${leagueId}/player/${matchup.right.playerId}`} className="min-w-0">
                    <span className="block truncate text-xs font-black text-slate-900 hover:text-emerald-700">{matchup.right.name}</span>
                    <span className="text-[10px] text-slate-400">{matchup.right.holesWon} holes won</span>
                  </Link>
                </div>
                <div className="mt-4 flex items-center justify-center gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                  <span>{matchup.ties} tied holes</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{matchup.leadChanges} lead changes</span>
                </div>
              </article>
            ))}
          </div>
        </EventInsightSection>
      ) : (
        <EventInsightSection
          title="Matchup theater"
          description="Assigned match-play battles and lead changes"
          action={<Swords size={15} className="text-slate-400" />}
        >
          <EventInsightEmpty>This event does not have completed assigned matchups.</EventInsightEmpty>
        </EventInsightSection>
      )}

      <EventInsightSection
        title="Skins board"
        description="Every unique gross and net hole winner remains available for scorecard review"
        action={<EventInsightBadge><Zap size={10} /> {grossSkins.length + netSkins.length} skins</EventInsightBadge>}
      >
        <div className="grid gap-4 p-4 md:grid-cols-2 sm:p-5">
          <SkinsList
            label="Gross"
            skins={grossSkins}
            valueKey="gross"
            iconClass="text-amber-500"
            badgeClass="bg-amber-50 text-amber-600 border-amber-200"
            onViewAll={() => onOpenSkins({
              label: "Gross",
              skins: grossSkins,
              valueKey: "gross",
              iconClass: "text-amber-500",
              badgeClass: "bg-amber-50 text-amber-600 border-amber-200",
            })}
          />
          <SkinsList
            label="Net"
            skins={netSkins}
            valueKey="net"
            iconClass="text-violet-500"
            badgeClass="bg-violet-50 text-violet-600 border-violet-200"
            onViewAll={() => onOpenSkins({
              label: "Net",
              skins: netSkins,
              valueKey: "net",
              iconClass: "text-violet-500",
              badgeClass: "bg-violet-50 text-violet-600 border-violet-200",
            })}
          />
        </div>
      </EventInsightSection>
    </div>
  );
}
