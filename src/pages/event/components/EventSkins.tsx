import { Flag, ListOrdered, Zap } from "lucide-react";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import EventRoundsTable from "./EventRoundsTable";
import PlayerNameLink from "./PlayerNameLink";
import type {
  EventInsightRound,
  EventInsightSkin,
} from "@/features/league-intelligence/types";

export type SkinsDrawerContent = {
  label: string;
  skins: EventInsightSkin[];
  valueKey: "gross" | "net";
  iconClass: string;
  badgeClass: string;
};

export function SkinsList({
  onViewAll,
  ...content
}: SkinsDrawerContent & { onViewAll: () => void }) {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Zap size={13} className={content.iconClass} strokeWidth={2.5} />
          <h3 className="text-xs font-semibold text-gray-800">{content.label} Skins</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${content.badgeClass}`}>
            {content.skins.length}
          </span>
          <button
            type="button"
            onClick={onViewAll}
            className="text-[10px] font-semibold text-gray-500 hover:text-gray-700"
          >
            View
          </button>
        </div>
      </div>
      <div className="p-3">
        <SkinRows {...content} linkPlayers />
      </div>
    </SurfaceCard>
  );
}

export function SkinsRoundScoresDrawer({
  rounds,
  ...content
}: SkinsDrawerContent & { rounds: EventInsightRound[] }) {
  if (!rounds?.length) {
    return <p className="text-sm text-gray-400">No scorecards available yet.</p>;
  }

  const highlightedHolesByPlayer = content.skins.reduce(
    (holesByPlayer: Record<number, number[]>, skin) => {
      const playerId = Number(skin?.playerId ?? 0);
      const hole = Number(skin?.hole ?? 0);
      if (playerId && hole) {
        holesByPlayer[playerId] = [...(holesByPlayer[playerId] || []), hole];
      }
      return holesByPlayer;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <SurfaceCard>
        <PanelBar variant="header">
          <div className="flex items-center gap-2">
            <Zap size={14} className={content.iconClass} strokeWidth={2.5} />
            <h3 className="text-sm font-semibold text-gray-800">{content.label} Skin Winners</h3>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${content.badgeClass}`}>
            {content.skins.length} skins
          </span>
        </PanelBar>
        <div className="p-3">
          <SkinRows {...content} />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <ListOrdered size={14} className="text-gray-400" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-gray-800">Round Scores</h3>
          </div>
          <span className="text-[10px] font-semibold text-amber-600">
            Highlighted cells mark skin holes
          </span>
        </div>
        <div className="overflow-x-auto">
          <EventRoundsTable
            rounds={rounds}
            highlightedHolesByPlayer={highlightedHolesByPlayer}
            highlightUnderPar={false}
            holeScoreKey={content.valueKey}
          />
        </div>
      </SurfaceCard>
    </div>
  );
}

function SkinRows({
  label,
  skins,
  valueKey,
  linkPlayers = false,
}: SkinsDrawerContent & { linkPlayers?: boolean }) {
  if (skins.length === 0) {
    return <p className="text-[11px] italic text-gray-300">No {label.toLowerCase()} skins yet</p>;
  }

  return (
    <div className="max-h-45 divide-y divide-gray-50 overflow-y-auto rounded-md border border-gray-100 pr-1">
      {skins.map((skin, index) => (
        <div key={`${skin.playerId}-${skin.hole}-${index}`} className="flex items-center justify-between bg-white px-2.5 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-amber-200 bg-amber-50">
              <Flag size={9} className="text-amber-500" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              {linkPlayers ? (
                <PlayerNameLink
                  playerId={skin.playerId}
                  className="truncate text-[11px] font-semibold leading-tight text-gray-800 hover:text-slate-900 hover:underline"
                >
                  {skin.name}
                </PlayerNameLink>
              ) : (
                <p className="truncate text-[11px] font-semibold leading-tight text-gray-800">{skin.name}</p>
              )}
              <p className="text-[10px] text-gray-400">Hole {skin.hole}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] text-gray-500">
              {skin.scoreLabel}
            </span>
            <span className="text-xs font-bold tabular-nums text-gray-700">{skin[valueKey]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
