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
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-xl font-black tracking-tight text-slate-950">Get ready for your first round</h2>
    <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
      {[{ label: "Create an event", done: setup.hasEvent }, { label: "Invite players (optional)", done: invitationsSent }, { label: "Save your first scores", done: false }].map(step => <span key={step.label} className="inline-flex items-center gap-2">{step.done ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} className="text-slate-400" />}<span>{step.label}{step.done ? " · Done" : ""}</span></span>)}
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-4">
      <Link to={setup.nextAction.to} className="inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">{setup.nextAction.label}</Link>
      <a href="#league-announcements" className="text-sm font-bold text-slate-600 underline">Invite players</a>
    </div>
  </section>;
}
