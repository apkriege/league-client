import { TrendingDown, TrendingUp, User } from "lucide-react";
import Table from "@/components/Table";
import type { EventLeaderboardEntry, EventLeaderboardSort } from "../eventLeaderboard";
import PlayerNameLink from "./PlayerNameLink";
import { memo } from "react";
import { formatHandicap } from "@/utils/handicap";

export const ScoreLeaderboard = memo(function ScoreLeaderboard({
  leaderboard,
  sortBy,
}: {
  leaderboard: EventLeaderboardEntry[];
  sortBy: EventLeaderboardSort;
}) {
  return (
    <Table
      data={leaderboard}
      search={false}
      variant="clean"
      noBorder
      className="max-h-80 overflow-auto"
      tableClassName="w-full min-w-[28rem] table-fixed text-left"
      renderTable={(visibleLeaderboard) => (
        <>
          <colgroup>
            <col className="w-10" />
            <col />
            <col className="w-14" />
            <col className="w-16" />
            <col className="w-14" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="section-kicker border-b border-gray-100">
              <th className="w-8 px-3 py-2">#</th>
              <th className="px-2.5 py-2">
                <span className="flex items-center gap-1"><User size={10} /> Player</span>
              </th>
              <SortHeading label="PTS" column="points" active={sortBy} descending />
              <SortHeading label="GROSS" column="lowGross" active={sortBy} />
              <SortHeading label="NET" column="lowNet" active={sortBy} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleLeaderboard.map((entry) => {
              const index = leaderboard.indexOf(entry);
              return (
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
                          Index {formatHandicap(entry.handicap)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <LeaderboardValueCell value={entry.points} active={sortBy === "points"} />
                  <LeaderboardValueCell value={entry.gross} active={sortBy === "lowGross"} />
                  <LeaderboardValueCell value={entry.net} active={sortBy === "lowNet"} />
                </tr>
              );
            })}
          </tbody>
        </>
      )}
    />
  );
});

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

const initials = (name: string) =>
  String(name || "").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const rankColor = (index: number) =>
  index === 0 ? "text-amber-600" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-500" : "text-gray-400";
