import { CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router";
import { useLeagueInvitations } from "@api/operations/queries";
import { getLeagueGettingStarted } from "../leagueGettingStarted";

type Props = { leagueId: number; events: Parameters<typeof getLeagueGettingStarted>[1]; hasRecordedScores: boolean; hasLinkedPlayer: boolean };
export default function LeagueGettingStarted({ leagueId, events, hasRecordedScores, hasLinkedPlayer }: Props) {
  const query = useLeagueInvitations(leagueId);
  const setup = getLeagueGettingStarted(leagueId, events, hasRecordedScores);
  if (!setup.visible) return null;
  const invitationsSent = hasLinkedPlayer || (query.data ?? []).some((invite: { status: string }) => ["pending", "claimed"].includes(invite.status));
  return <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-sm font-bold tracking-tight text-slate-950">Get ready for your first round</h2>
    <Link to={setup.nextAction.to} className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white sm:min-h-8">{setup.nextAction.label}</Link>
    </div>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
      {[{ label: "Create an event", done: setup.hasEvent }, { label: "Invite players (optional)", done: invitationsSent }, { label: "Save your first scores", done: false }].map(step => <span key={step.label} className="inline-flex items-center gap-2">{step.done ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-400" />}<span>{step.label}{step.done ? " · Done" : ""}</span></span>)}
    </div>
    <a href="#league-announcements" className="mt-2 inline-flex min-h-11 items-center text-xs font-bold text-slate-500 underline sm:min-h-8">Invite players</a>
  </section>;
}
