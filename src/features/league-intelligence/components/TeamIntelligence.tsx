import { Activity, BrainCircuit, Sparkles, Swords, Trophy, Users } from "lucide-react";
import type { TeamProfile } from "@api/teams/types";
import { buildTeamIntelligence } from "../teamIntelligence";

const record = (wins: number, losses: number, ties: number) =>
  `${wins}-${losses}${ties ? `-${ties}` : ""}`;

const formatPoints = (value: number) =>
  Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(1);

function HeaderMetric({
  label,
  value,
  detail,
  tone = "text-white",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 bg-slate-950/70 px-3 py-3.5 sm:px-4">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-sm font-black ${tone}`}>{value}</p>
      <p className="mt-1 truncate text-[9px] text-slate-400">{detail}</p>
    </div>
  );
}

export default function TeamIntelligence({ team }: { team: TeamProfile }) {
  const insight = buildTeamIntelligence(team);
  const topContributor = insight.contributions[0];
  const topPairing = insight.pairings[0];
  const primaryRival = insight.rivalries[0];
  const formLeader = insight.formOrder[0];
  const overviewMetrics = [
    { label: "Team points", value: formatPoints(insight.overview.teamPoints), detail: "season total" },
    { label: "Player points", value: formatPoints(insight.overview.playerPoints), detail: "from player rounds" },
    { label: "Events played", value: String(insight.overview.completedEvents), detail: `${insight.overview.scheduledEvents} scheduled` },
    { label: "Season rank", value: insight.overview.seasonRank ? `#${insight.overview.seasonRank}` : "—", detail: `${insight.overview.rankedTeams} teams ranked` },
  ];

  return (
    <section
      aria-labelledby="team-intelligence-heading"
      className="relative overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.8)]"
    >
      <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-emerald-300">
            <BrainCircuit size={15} strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Team intelligence</p>
          </div>
          <h2 id="team-intelligence-heading" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Team DNA
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
            See who drives results, which pairings work, and where the biggest rivalries stand.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:min-w-105 sm:grid-cols-3">
          <HeaderMetric
            label="Match record"
            value={record(insight.record.wins, insight.record.losses, insight.record.ties)}
            detail={`${insight.record.matches} completed matchups`}
            tone="text-amber-300"
          />
          <HeaderMetric
            label="Win rate"
            value={`${insight.overview.winRate}%`}
            detail={insight.record.matches > 0 ? `${insight.record.wins} team wins` : "Building baseline"}
            tone="text-emerald-300"
          />
          <HeaderMetric
            label="In form"
            value={formLeader?.name ?? "Building form"}
            detail={formLeader ? `${formLeader.recentAverage} avg points` : "No completed events"}
          />
        </div>
      </div>

      <div className="relative grid grid-cols-2 border-t border-white/10 lg:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <div key={metric.label} className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 lg:border-b-0">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-1 text-sm font-black tabular-nums text-white">{metric.value}</p>
            <p className="mt-0.5 text-[9px] text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300">
              <Activity size={15} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Team story</p>
              <h3 className="mt-0.5 text-sm font-black text-white">What defines this group</h3>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-slate-400">
            {team.players.length} {team.players.length === 1 ? "player" : "players"}
          </span>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          <article className="bg-slate-950/70 px-5 py-4">
            <div className="flex items-center justify-between gap-2 text-amber-300">
              <div className="flex items-center gap-2">
                <Trophy size={14} strokeWidth={2.5} />
                <p className="text-[9px] font-black uppercase tracking-[0.12em]">Top contributor</p>
              </div>
              <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[8px] font-bold text-slate-300 ring-1 ring-white/10">
                {topContributor ? `${formatPoints(topContributor.points)} pts` : "No data"}
              </span>
            </div>
            <h4 className="mt-3 text-[13px] font-black leading-5 text-white">
              {topContributor?.name ?? "Contribution is building"}
            </h4>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              {topContributor
                ? `${topContributor.averagePoints} average points across ${topContributor.events} events.`
                : "Completed player rounds will reveal the team's leading scorer."}
            </p>
          </article>

          <article className="bg-slate-950/70 px-5 py-4">
            <div className="flex items-center justify-between gap-2 text-blue-200">
              <div className="flex items-center gap-2">
                <Users size={14} strokeWidth={2.5} />
                <p className="text-[9px] font-black uppercase tracking-[0.12em]">Core pairing</p>
              </div>
              <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[8px] font-bold text-slate-300 ring-1 ring-white/10">
                {topPairing ? `${topPairing.winRate}% wins` : "No data"}
              </span>
            </div>
            <h4 className="mt-3 text-[13px] font-black leading-5 text-white">
              {topPairing?.names.join(" + ") ?? "Pairing history is building"}
            </h4>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              {topPairing
                ? `${topPairing.events} events together and ${formatPoints(topPairing.points)} combined points.`
                : "Shared events will identify the team's most reliable combination."}
            </p>
          </article>

          <article className="bg-slate-950/70 px-5 py-4">
            <div className="flex items-center justify-between gap-2 text-violet-300">
              <div className="flex items-center gap-2">
                <Swords size={14} strokeWidth={2.5} />
                <p className="text-[9px] font-black uppercase tracking-[0.12em]">Primary rivalry</p>
              </div>
              <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[8px] font-bold text-slate-300 ring-1 ring-white/10">
                {primaryRival
                  ? record(primaryRival.wins, primaryRival.losses, primaryRival.ties)
                  : "No record"}
              </span>
            </div>
            <h4 className="mt-3 text-[13px] font-black leading-5 text-white">
              {primaryRival?.name ?? "A rival has not emerged"}
            </h4>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              {primaryRival
                ? `${primaryRival.meetings} head-to-head meetings have shaped this matchup.`
                : "Rivalry history appears after assigned team matchups."}
            </p>
          </article>

          <article className="bg-slate-950/70 px-5 py-4">
            <div className="flex items-center justify-between gap-2 text-emerald-300">
              <div className="flex items-center gap-2">
                <Sparkles size={14} strokeWidth={2.5} />
                <p className="text-[9px] font-black uppercase tracking-[0.12em]">Scoring identity</p>
              </div>
              <span className="rounded-full bg-white/[0.07] px-2 py-1 text-[8px] font-bold text-slate-300 ring-1 ring-white/10">
                {insight.totals.birdies} birdies
              </span>
            </div>
            <h4 className="mt-3 text-[13px] font-black leading-5 text-white">
              {insight.totals.birdies > 0 ? "The team can create red numbers" : "The scoring profile is building"}
            </h4>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              {insight.totals.pars} pars and {insight.totals.bogeys} bogeys accompany the team's {insight.totals.birdies} birdies.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
