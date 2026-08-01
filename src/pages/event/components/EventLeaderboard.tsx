import { Medal, TrendingDown, TrendingUp, Trophy, User } from "lucide-react";
import SurfaceCard from "@/components/layout/SurfaceCard";
import TableHeaderRow from "@/components/layout/TableHeaderRow";
import type { EventLeaderboardEntry, EventLeaderboardSort } from "../eventLeaderboard";
import PlayerNameLink from "./PlayerNameLink";

export function ScoreLeaderboard({
  leaderboard,
  sortBy,
}: {
  leaderboard: EventLeaderboardEntry[];
  sortBy: EventLeaderboardSort;
}) {
  return (
    <div className="max-h-70 overflow-auto">
      <table className="w-full min-w-[28rem] table-fixed text-left">
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-14" />
          <col className="w-16" />
          <col className="w-14" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-gray-50">
          <TableHeaderRow className="border-b border-gray-100">
            <th className="w-8 px-3 py-2">#</th>
            <th className="px-2.5 py-2">
              <span className="flex items-center gap-1"><User size={10} /> Player</span>
            </th>
            <SortHeading label="PTS" column="points" active={sortBy} descending />
            <SortHeading label="GROSS" column="lowGross" active={sortBy} />
            <SortHeading label="NET" column="lowNet" active={sortBy} />
          </TableHeaderRow>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leaderboard.map((entry, index) => (
            <tr
              key={entry.playerId}
              className={`text-xs ${index === 0 ? "bg-amber-50/40" : "hover:bg-gray-50/60"}`}
            >
              <td className="px-3 py-2">
                <span className={`text-xs font-bold ${rankColor(index)}`}>
                  {index < 9 ? `0${index + 1}` : index + 1}
                </span>
              </td>
              <td className="px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${index === 0 ? "border-amber-200 bg-amber-100 text-amber-700" : "border-gray-200 bg-gray-100 text-gray-500"}`}>
                    {initials(entry.name)}
                  </div>
                  <div>
                    <PlayerNameLink
                      playerId={entry.playerId}
                      className="text-xs font-semibold leading-tight text-gray-800 hover:text-slate-900 hover:underline"
                    >
                      {entry.name}
                    </PlayerNameLink>
                    <p className="text-[10px] text-gray-400">
                      HCP {entry.handicap != null ? entry.handicap.toFixed(1) : "—"}
                    </p>
                  </div>
                </div>
              </td>
              <LeaderboardValueCell value={entry.points} active={sortBy === "points"} />
              <LeaderboardValueCell value={entry.gross} active={sortBy === "lowGross"} />
              <LeaderboardValueCell value={entry.net} active={sortBy === "lowNet"} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortHeading({
  label,
  column,
  active,
  descending = false,
}: {
  label: string;
  column: EventLeaderboardSort;
  active: EventLeaderboardSort;
  descending?: boolean;
}) {
  const selected = column === active;
  return (
    <th
      aria-sort={selected ? (descending ? "descending" : "ascending") : "none"}
      className={`px-1.5 py-2 text-right ${selected ? "text-gray-800" : ""}`}
    >
      <span className="inline-flex items-center justify-end gap-1">
        {label}
        {selected && (descending ? <TrendingDown size={10} /> : <TrendingUp size={10} />)}
      </span>
    </th>
  );
}

function LeaderboardValueCell({ value, active }: { value: number | null; active: boolean }) {
  return (
    <td className={`px-1.5 py-2 text-right tabular-nums ${active ? "bg-gray-50/70" : ""}`}>
      <span className={`inline-block min-w-8 rounded border px-1.5 py-0.5 text-xs font-bold ${active ? "border-amber-200 bg-amber-100 text-amber-700" : "border-gray-200 bg-gray-100 text-gray-600"}`}>
        {value ?? "—"}
      </span>
    </td>
  );
}

export function TopThreePlayers({ players, mode }: { players: any[]; mode: "points" | "net" }) {
  const label = mode === "points" ? "Top Points" : "Low Net Leaders";
  const valueLabel = mode === "points" ? "PTS" : "NET";

  return (
    <SurfaceCard as="section">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-500" strokeWidth={2.5} />
          <h3 className="text-xs font-semibold text-gray-800">{label}</h3>
        </div>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500">Top 3</span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {players.map((player, index) => {
          const style = podiumStyles[index] || podiumStyles[2];
          const value = Number(player?.value ?? 0);
          return (
            <div key={`${player.playerId}-${index}`} className={`relative overflow-hidden rounded-lg border px-3 py-2.5 shadow-xs ${style.card}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${style.medal}`}>
                    {initials(player.name) || style.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Medal size={13} className={style.icon} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">#{style.rank}</span>
                    </div>
                    <PlayerNameLink playerId={player.playerId} className="mt-0.5 block truncate text-xs font-bold text-gray-900 hover:text-slate-900 hover:underline">
                      {player.name}
                    </PlayerNameLink>
                    <p className="text-[11px] font-medium text-gray-400">
                      HCP {player.handicap != null && Number.isFinite(Number(player.handicap)) ? Number(player.handicap).toFixed(1) : "—"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{valueLabel}</p>
                  <p className="text-xl font-black leading-none text-gray-950">{mode === "points" ? value : Math.round(value)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

const podiumStyles = [
  { rank: "1", medal: "border-amber-200 bg-amber-100 text-amber-700", card: "border-amber-200 bg-linear-to-br from-amber-50 to-white", icon: "text-amber-500" },
  { rank: "2", medal: "border-slate-200 bg-slate-100 text-slate-600", card: "border-slate-200 bg-linear-to-br from-slate-50 to-white", icon: "text-slate-400" },
  { rank: "3", medal: "border-orange-200 bg-orange-100 text-orange-700", card: "border-orange-200 bg-linear-to-br from-orange-50 to-white", icon: "text-orange-500" },
];

const initials = (name: string) =>
  String(name || "").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const rankColor = (index: number) =>
  index === 0 ? "text-amber-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-500" : "text-gray-400";
