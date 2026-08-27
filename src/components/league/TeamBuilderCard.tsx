import { SquarePen, Trash2, X } from "lucide-react";
import { formatHandicap } from "@/utils/handicap";

export type TeamBuilderPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  handicap?: number | string | null;
};

type TeamBuilderCardProps = {
  name: string;
  players: TeamBuilderPlayer[];
  density?: "default" | "compact";
  onEdit?: () => void;
  onDelete?: () => void;
  onRemovePlayer?: (playerId: number) => void;
};

export default function TeamBuilderCard({
  name,
  players,
  density = "default",
  onEdit,
  onDelete,
  onRemovePlayer,
}: TeamBuilderCardProps) {
  const isCompact = density === "compact";

  return (
    <div
      className={`w-full overflow-hidden border border-slate-200 bg-white ${
        isCompact ? "rounded-xl shadow-xs" : "rounded-2xl shadow-sm"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-3 ${
          isCompact ? "py-1.5" : "py-2.5"
        }`}
      >
        <div className="min-w-0">
          <p
            className={`truncate font-semibold text-slate-950 ${isCompact ? "text-xs" : "text-sm"}`}
          >
            {name}
          </p>
          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
            {players.length} {players.length === 1 ? "player" : "players"}
          </p>
        </div>
        {onEdit || onDelete ? (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ${name}`}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <SquarePen size={13} />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete ${name}`}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={`grid ${
          isCompact ? "grid-cols-2 gap-1 p-1.5" : "grid-cols-1 gap-1.5 p-2.5"
        }`}
      >
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex min-w-0 items-center justify-between gap-2 border border-slate-100 bg-slate-50/60 ${
              isCompact ? "rounded-lg px-2 py-1.5" : "w-full rounded-xl px-2.5 py-2 text-sm"
            }`}
          >
            <div className={`flex min-w-0 ${isCompact ? "items-center gap-1" : "flex-col"}`}>
              <span
                className={`truncate font-medium text-slate-900 ${isCompact ? "text-[11px]" : "text-xs"}`}
              >
                {player.firstName} {player.lastName}
              </span>
              <span className="shrink-0 text-[9px] text-slate-500">
                {isCompact
                  ? `· ${formatHandicap(player.handicap)}`
                  : `HCP: ${formatHandicap(player.handicap)}`}
              </span>
            </div>
            {onRemovePlayer ? (
              <button
                type="button"
                onClick={() => onRemovePlayer(player.id)}
                aria-label={`Remove ${player.firstName} ${player.lastName} from ${name}`}
                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
