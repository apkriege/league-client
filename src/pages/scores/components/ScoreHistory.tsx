import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getScoreHistory, restoreScoreRevision } from "../scoreHistory";
import { invalidateResults } from "@/lib/invalidateResults";
import { getApiErrorMessage } from "@/lib/apiError";

export default function ScoreHistory({ leagueId, eventId }: { leagueId: number; eventId: number }) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const history = useQuery({
    queryKey: ["league", leagueId, "event", eventId, "score-history"],
    queryFn: () => getScoreHistory(leagueId, eventId),
    enabled: open,
  });
  const restore = useMutation({
    mutationFn: ({ id, version }: { id: number; version: "before" | "after" }) => restoreScoreRevision(leagueId, eventId, id, version),
    onSuccess: () => invalidateResults(client, leagueId),
  });

  return (
    <section aria-label="Score history" className="my-5 rounded-2xl border border-slate-200 bg-white p-5">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="text-sm font-bold text-slate-900">
        {open ? "Hide score history" : "Score history"}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {history.isLoading && <p role="status">Loading score history…</p>}
          {history.isError && <p role="alert">{getApiErrorMessage(history.error, "Unable to load score history.")}</p>}
          {restore.isError && <p role="alert">{getApiErrorMessage(restore.error, "Unable to restore scores.")}</p>}
          {restore.isSuccess && <p role="status" className="text-sm text-emerald-700">Scores restored and results recalculated.</p>}
          {history.data?.length === 0 && <p className="text-sm text-slate-500">Score changes saved from now on will appear here.</p>}
          {history.data?.map((revision) => {
            const date = new Date(revision.createdAt).toLocaleString();
            const participants = [...revision.metadata.after.players, ...revision.metadata.after.teamScores];
            const previous = [...revision.metadata.before.players, ...revision.metadata.before.teamScores];
            return (
              <details key={revision.id} className="border-t border-slate-100 pt-3">
                <summary className="cursor-pointer text-sm font-bold">{date} · {revision.user ? `${revision.user.firstName} ${revision.user.lastName}` : "Administrator"}</summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-96 text-sm">
                    <thead><tr><th className="p-2 text-left">Player / Team</th><th className="p-2 text-right">Hole</th><th className="p-2 text-right">Before</th><th className="p-2 text-right">Saved</th></tr></thead>
                    <tbody>{participants.flatMap((participant) =>
                      Object.entries(participant.scores).map(([hole, score]) => (
                        <tr key={`${participant.participantId}:${hole}`} className="border-t border-slate-100 tabular-nums">
                          <th className="p-2 text-left font-medium">{participant.name}</th><td className="p-2 text-right">{hole}</td>
                          <td className="p-2 text-right">{previous.find((entry) => entry.participantId === participant.participantId)?.scores[hole] ?? "—"}</td>
                          <td className="p-2 text-right">{score}</td>
                        </tr>
                      )),
                    )}</tbody>
                  </table>
                </div>
                <button type="button" disabled={restore.isPending} className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50" onClick={() => {
                  if (window.confirm(`Restore the saved scores from ${date}? This recalculates event and season results.`)) restore.mutate({ id: revision.id, version: "after" });
                }}>Restore these scores</button>
                {previous.length > 0 && <button type="button" disabled={restore.isPending} className="ml-2 mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50" onClick={() => {
                  if (window.confirm(`Restore the scores shown in Before for ${date}? This recalculates event and season results.`)) restore.mutate({ id: revision.id, version: "before" });
                }}>Restore previous scores</button>}
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
