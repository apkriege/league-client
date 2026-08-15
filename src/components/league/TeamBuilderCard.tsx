import { SquarePen, Trash2, X } from "lucide-react";

export type TeamBuilderPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  handicap?: number | string | null;
};

type TeamBuilderCardProps = {
  name: string;
  players: TeamBuilderPlayer[];
  onEdit: () => void;
  onDelete: () => void;
  onRemovePlayer: (playerId: number) => void;
};

export default function TeamBuilderCard({
  name,
  players,
  onEdit,
  onDelete,
  onRemovePlayer,
}: TeamBuilderCardProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{name}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {players.length} {players.length === 1 ? "player" : "players"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${name}`}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            <SquarePen size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${name}`}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 p-2.5">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2 text-sm"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium text-slate-900">
                {player.firstName} {player.lastName}
              </span>
              <span className="text-[10px] text-slate-900/80">
                HCP: {player.handicap ?? "-"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemovePlayer(player.id)}
              aria-label={`Remove ${player.firstName} ${player.lastName} from ${name}`}
              className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
