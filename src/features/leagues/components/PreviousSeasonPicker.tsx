import type { AdminLeagueListItem } from "@api/admin/types";
import { clearCreateLeagueDraft } from "@/pages/league/leagueDraft";
import { getAvailablePreviousSeasons } from "../previousSeasons";
import { CalendarDays, ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

type PreviousSeasonPickerProps = {
  leagues: AdminLeagueListItem[];
  ownerId: number;
};

export default function PreviousSeasonPicker({
  leagues,
  ownerId,
}: PreviousSeasonPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableSeasons = getAvailablePreviousSeasons(leagues, ownerId);

  if (availableSeasons.length === 0) return null;

  return (
    <section className="mb-5 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-sky-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black">Use a previous season</p>
          <p className="mt-1 text-xs leading-5 text-sky-900/75">
            Load its league settings, roster, teams, handicaps, and scoring periods, then review
            everything in the normal creation flow.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-800"
        >
          <RefreshCw size={13} />
          Choose Previous Season
          <ChevronDown
            size={13}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 grid gap-2 border-t border-sky-200 pt-4 sm:grid-cols-2">
          {availableSeasons.map((league) => (
            <Link
              key={league.id}
              to={`/leagues/create?renewFrom=${league.id}`}
              onClick={() => clearCreateLeagueDraft(ownerId)}
              className="flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-white px-3 py-2.5 text-left transition hover:border-sky-300 hover:bg-sky-100/60"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-black text-slate-900">
                  {league.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <CalendarDays size={11} />
                  {new Date(league.startDate).getUTCFullYear()} season
                </span>
              </span>
              <span className="shrink-0 text-[11px] font-black text-sky-700">Use season</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
